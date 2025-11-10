"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { DateRange } from "react-day-picker"; // ✅ Fix: Import official DateRange type

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
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type Visitor = {
  id: string;
  name: string;
  mobile_number: string;
  college: string | null;
  person_to_meet: string;
  purpose_of_visit: string;
  in_time: string;
};

export default function VisitorDashboardClient({
  initialVisitors,
}: {
  initialVisitors: Visitor[];
}) {
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors || []);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Visitor>("in_time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loggingOut, setLoggingOut] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(); // ✅ Proper type usage

  const rowsPerPage = 10;

  // Fetch visitors (optional live refresh)
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

  // Filter + Search + Date Range
  const filteredRows = useMemo(() => {
    return visitors.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.mobile_number.includes(search.toLowerCase());

      const matchesFilters = filters.length
        ? filters.includes(v.college ?? "")
        : true;

      const matchesDateRange =
        dateRange?.from && dateRange?.to
          ? (() => {
              const visitDate = new Date(v.in_time);
              const start = new Date(dateRange.from);
              const end = new Date(dateRange.to);
              return visitDate >= start && visitDate <= end;
            })()
          : true;

      return matchesSearch && matchesFilters && matchesDateRange;
    });
  }, [visitors, search, filters, dateRange]);

  // Sorting
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
      const d = new Date(v.in_time);
      const date = d.toISOString().split("T")[0];
      const time = d.toTimeString().split(" ")[0];
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

  // Logout
  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-[#e9ecf2] to-[#dce3ef] dark:from-[#0a0b0f] dark:via-[#10131a] dark:to-[#141821] p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent">
          Visitor Logs
        </h1>
        <div className="flex gap-3">
          <Button
            onClick={exportCSV}
            className="bg-gradient-to-r from-[#5381ED] to-[#2A7B9B] text-white hover:opacity-90"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search name or mobile..."
              className="pl-8 bg-white/70 dark:bg-zinc-800/70 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* College Filter */}
          <Select onValueChange={(val) => setFilters([val])}>
            <SelectTrigger className="w-[200px] bg-white/70 dark:bg-zinc-800/70 rounded-xl">
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

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[250px] justify-start text-left font-normal bg-white/70 dark:bg-zinc-800/70 rounded-xl"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "LLL dd, yyyy")} - ${format(
                      dateRange.to,
                      "LLL dd, yyyy"
                    )}`
                  : "Select date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {(filters.length > 0 || dateRange) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters([]);
                setDateRange(undefined);
              }}
              className="text-red-500"
            >
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Sort */}
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
              <SelectItem value="in_time-desc">Newest first</SelectItem>
              <SelectItem value="in_time-asc">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name (A–Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z–A)</SelectItem>
              <SelectItem value="college-asc">College (A–Z)</SelectItem>
              <SelectItem value="college-desc">College (Z–A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border rounded-xl overflow-hidden bg-white/80 dark:bg-zinc-900/70 shadow-md"
      >
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
            {pageRows.length > 0 ? (
              pageRows.map((v) => {
                const d = new Date(v.in_time);
                const date = d.toISOString().split("T")[0];
                const time = d.toTimeString().split(" ")[0];
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
                  </motion.tr>
                );
              })
            ) : (
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
      </motion.div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center gap-3 pt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
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
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
