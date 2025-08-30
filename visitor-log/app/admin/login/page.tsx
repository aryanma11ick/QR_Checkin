"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@supabase/supabase-js";

type Visitor = {
  id: string;
  name: string;
  mobile_number: string;
  college: string;
  person_to_meet: string;
  purpose_of_visit: string;
  in_time: string;
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch visitors if logged in
  useEffect(() => {
    if (user) {
      fetchVisitors();
    }
  }, [user]);

  const fetchVisitors = async () => {
    const { data, error } = await supabase
      .from("visitors")
      .select("*")
      .order("in_time", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setVisitors((data as Visitor[]) || []);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // -------------------------
  // If not logged in → Login Form
  // -------------------------
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5381ED] to-[#2A7B9B]">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-lg w-96 space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">Admin Login</h2>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </main>
    );
  }

  // -------------------------
  // If logged in → Visitor Records
  // -------------------------
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#5381ED] to-[#2A7B9B] p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Visitor Records</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">College</th>
              <th className="p-2">Person to Meet</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Check-in</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v.id} className="border-b">
                <td className="p-2">{v.name}</td>
                <td className="p-2">{v.mobile_number}</td>
                <td className="p-2">{v.college}</td>
                <td className="p-2">{v.person_to_meet}</td>
                <td className="p-2">{v.purpose_of_visit}</td>
                <td className="p-2">
                  {new Date(v.in_time).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
