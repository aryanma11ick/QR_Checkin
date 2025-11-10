"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Visitor = {
  id: string;
  name: string;
  mobile_number: string;
  college: string | null;
  person_to_meet: string;
  purpose_of_visit: string;
  in_time: string;
};

interface VisitorLogsPageProps {
  initialVisitors?: Visitor[];
}

export default function VisitorLogsPage({ initialVisitors }: VisitorLogsPageProps) {
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors || []);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Visitor>("in_time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const rowsPerPage = 10;

  // Fetch visitors
  useEffect(() => {
    const fetchVisitors = async () => {
      const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .order("in_time", { ascending: false });

      if (!error && data) setVisitors(data as Visitor[]);
    };
    fetchVisitors();
  }, []);

  // Filter + Search
  const filteredRows = useMemo(() => {
    return visitors.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.mobile_number.includes(search.toLowerCase());

      const matchesFilters = filters.length
        ? filters.includes(v.college ?? "")
        : true;

      return matchesSearch && matchesFilters;
    });
  }, [visitors, search, filters]);

  // Sort
  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];
    rows.sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";

      if (sortKey === "in_time") {
        const aDate = new Date(aVal as string).getTime();
        const bDate = new Date(bVal as string).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return rows;
  }, [filteredRows, sortKey, sortDirection]);

  const pageCount = Math.ceil(sortedRows.length / rowsPerPage);
  const pageRows = sortedRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Export CSV
  const exportCSV = () => {
    const header = [
      "Name",
      "Mobile",
      "College",
      "Person to Meet",
      "Purpose",
      "Date",
      "Time",
    ];

    const rows = sortedRows.map((v) => {
      const d = v.in_time ? new Date(v.in_time) : null;
      const date = d ? d.toISOString().split("T")[0] : "-";
      const time = d ? d.toTimeString().split(" ")[0] : "-";
      return [
        v.name,
        v.mobile_number,
        v.college ?? "",
        v.person_to_meet,
        v.purpose_of_visit,
        date,
        time,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "visitor_logs.csv";
    link.click();
  };

  const toggleFilter = (tag: string) => {
    setFilters((prev) =>
      prev.includes(tag) ? prev.filter((f) => f !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Visitor Logs</h1>
        <Button onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Search + Filters + Sort */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-3 items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search name or mobile..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters([])}
              className="text-red-500"
            >
              <X className="w-4 h-4 mr-1" /> Clear Filters
            </Button>
          )}
        </div>

        {/* Sort Menu */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select
            value={`${sortKey}-${sortDirection}`}
            onValueChange={(value) => {
              const [key, dir] = value.split("-");
              setSortKey(key as keyof Visitor);
              setSortDirection(dir as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_time-desc">Date (Newest first)</SelectItem>
              <SelectItem value="in_time-asc">Date (Oldest first)</SelectItem>
              <SelectItem value="name-asc">Name (A–Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z–A)</SelectItem>
              <SelectItem value="college-asc">College (A–Z)</SelectItem>
              <SelectItem value="college-desc">College (Z–A)</SelectItem>
              <SelectItem value="mobile_number-asc">Mobile (Ascending)</SelectItem>
              <SelectItem value="mobile_number-desc">Mobile (Descending)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters */}
      {filters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <Badge
              key={f}
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => toggleFilter(f)}
            >
              {f}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Person to Meet</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.map((v) => {
              const d = v.in_time ? new Date(v.in_time) : null;
              const date = d ? d.toISOString().split("T")[0] : "-";
              const time = d ? d.toTimeString().split(" ")[0] : "-";

              return (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.mobile_number}</TableCell>
                  <TableCell>
                    {v.college ? (
                      <Badge variant="secondary">{v.college}</Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{v.person_to_meet}</TableCell>
                  <TableCell className="max-w-lg truncate">
                    {v.purpose_of_visit}
                  </TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>{time}</TableCell>
                </TableRow>
              );
            })}

            {pageRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="p-6 text-center text-gray-500"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm">
            Page {page} of {pageCount}
          </span>

          <Button
            variant="outline"
            disabled={page === pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
