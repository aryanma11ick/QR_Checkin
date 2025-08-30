"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function VisitorPage() {
  const [form, setForm] = useState({
    name: "",
    mobile_number: "",
    purpose_of_visit: "",
    college: "",
    person_to_meet: "",
    comment_feedback: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [loading, setLoading] = useState(false);

  // 📍 Auto-capture location when page loads
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        (err) => {
          console.warn("Location access denied:", err.message);
        }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("visitors").insert([form]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("❌ Error saving visitor: " + error.message);
    } else {
      alert("✅ Visitor saved!");
      setForm({
        name: "",
        mobile_number: "",
        purpose_of_visit: "",
        college: "",
        person_to_meet: "",
        comment_feedback: "",
        latitude: form.latitude,
        longitude: form.longitude,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Visitor Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                value={form.mobile_number}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="purpose_of_visit">Purpose of Visit</Label>
              <Input
                id="purpose_of_visit"
                name="purpose_of_visit"
                value={form.purpose_of_visit}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                name="college"
                value={form.college}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="person_to_meet">Person to Meet</Label>
              <Input
                id="person_to_meet"
                name="person_to_meet"
                value={form.person_to_meet}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="comment_feedback">Comments / Feedback</Label>
              <Input
                id="comment_feedback"
                name="comment_feedback"
                value={form.comment_feedback}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
