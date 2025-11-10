"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
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
  LogOut,
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
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors || []);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Visitor>("in_time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loggingOut, setLoggingOut] = useState(false);
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

  // Unique colleges for dropdown
  const uniqueColleges = useMemo(() => {
    const set = new Set(visitors.map((v) => v.college).filter(Boolean));
    return Array.from(set) as string[];
  }, [visitors]);

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

  // Pagination
  const pageCount = Math.ceil(sortedRows.length / rowsPerPage);
  const pageRows = sortedRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Helper: CSV-safe escape (wrap in quotes and double any internal quotes)
  const csvEscape = (value: any) => {
    if (value === null || value === undefined) return '""';
    const s = String(value);
    return `"${s.replace(/"/g, '""')}"`;
  };

  // Export CSV (Excel-friendly)
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

      // Format date as DD-MM-YYYY for readability in Excel
      const date =
        d
          ? [
              String(d.getDate()).padStart(2, "0"),
              String(d.getMonth() + 1).padStart(2, "0"),
              String(d.getFullYear()),
            ].join("-")
          : "-";

      // Format time as HH:MM:SS (24h)
      const time = d
        ? [
            String(d.getHours()).padStart(2, "0"),
            String(d.getMinutes()).padStart(2, "0"),
            String(d.getSeconds()).padStart(2, "0"),
          ].join(":")
        : "-";

      // Prevent Excel scientific notation by using ="1234567890"
      const safeMobile = v.mobile_number
        ? `="${String(v.mobile_number)}"`
        : '""';

      return [
        csvEscape(v.name),
        safeMobile, // intentionally not escaped with csvEscape so Excel keeps it as formula-like ="..."
        csvEscape(v.college ?? ""),
        csvEscape(v.person_to_meet),
        csvEscape(v.purpose_of_visit),
        csvEscape(date),
        csvEscape(time),
      ];
    });

    // Build CSV string
    const csvArray = [
      header.map(csvEscape).join(","), // header
      ...rows.map((r) => r.join(",")),
    ];
    const csvString = csvArray.join("\n");

    // Create blob and download with timestamped filename
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const filename = `visitor_logs_${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toggleFilter = (tag: string) => {
    setFilters((prev) =>
      prev.includes(tag) ? prev.filter((f) => f !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-[#e9ecf2] to-[#dce3ef] dark:from-[#0a0b0f] dark:via-[#10131a] dark:to-[#141821] p-0 flex flex-col">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-8 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent">
          Visitor Logs Dashboard
        </h1>
        <div className="flex gap-3">
          <Button
            onClick={exportCSV}
            className="bg-gradient-to-r from-[#5381ED] to-[#2A7B9B] text-white hover:opacity-90 transition-all"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1 p-8 space-y-8"
      >
        {/* Search + Filters + Sort */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-72">
              <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search name or mobile..."
                className="pl-8 bg-white/70 dark:bg-zinc-800/70 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select onValueChange={(val) => toggleFilter(val)}>
              <SelectTrigger className="w-[220px] bg-white/70 dark:bg-zinc-800/70 rounded-xl">
                <SelectValue placeholder="Filter by college" />
              </SelectTrigger>
              <SelectContent>
                {uniqueColleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters([])}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </div>

          {/* Sort Menu */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Sort by:
            </span>
            <Select
              value={`${sortKey}-${sortDirection}`}
              onValueChange={(value) => {
                const [key, dir] = value.split("-");
                setSortKey(key as keyof Visitor);
                setSortDirection(dir as "asc" | "desc");
              }}
            >
              <SelectTrigger className="w-[200px] bg-white/70 dark:bg-zinc-800/70 rounded-xl">
                <SelectValue placeholder="Select sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_time-desc">Newest First</SelectItem>
                <SelectItem value="in_time-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                <SelectItem value="college-asc">College (A–Z)</SelectItem>
                <SelectItem value="college-desc">College (Z–A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <Badge
                key={f}
                className="flex items-center gap-1 cursor-pointer bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:opacity-90"
                onClick={() => toggleFilter(f)}
              >
                {f}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        )}

        {/* Table Section */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#eff4ff] to-[#f7faff] dark:from-zinc-800 dark:to-zinc-900">
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
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="hover:bg-blue-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.mobile_number}</TableCell>
                    <TableCell>
                      {v.college ? (
                        <Badge variant="secondary" className="rounded-md">
                          {v.college}
                        </Badge>
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
                  </motion.tr>
                );
              })}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center items-center gap-3 pt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {pageCount}
            </span>

            <Button
              variant="outline"
              disabled={page === pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
