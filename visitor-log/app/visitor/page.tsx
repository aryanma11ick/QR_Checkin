"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const colleges = [
  "Symbiosis Institute of Media & Communication (SIMC)",
  "Symbiosis Institute of Business Management (SIBM)",
  "Symbiosis Institute of Digital and Telecom Management (SIDTM)",
  "Symbiosis Institute of Technology (SIT)",
  "Symbiosis School of Banking and Finance (SSBF)",
  "Symbiosis School of Biological Sciences (SSBS)",
  "Symbiosis School of Visual Arts and Photography (SSVAP)",
  "Symbiosis School of Culinary Arts and Nutritional Sciences (SSCANs)",
  "Symbiosis College of Nursing (SCON)",
  "Symbiosis School of Online and Digital Learning (SSODL)",
  "Symbiosis Centre for Health Skills (SCHS)",
  "Symbiosis School of Sports Sciences (SSSS)",
  "Symbiosis Institute of Health Sciences (SIHS)",
  "Symbiosis Medical College for Women (SMCW)",
  "Symbiosis Artificial Intelligence Institute (SAII)",
  "Symbiosis College of Physiotherapy",
  "Symbiosis Community Outreach Programme & Extension (SCOPE)",
  "Symbiosis Centre for Entrepreneurship and Innovation (SCEI)",
  "Symbiosis Centre for Research and Innovation (SCRI)",
  "Symbiosis Teaching Learning Resource Centre (STLRC)",
  "Symbiosis University Hospital and Research Centre (SUHRC)",
];

export default function VisitorForm() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [college, setCollege] = useState("");
  const [personToMeet, setPersonToMeet] = useState("");
  const [purpose, setPurpose] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const { error } = await supabase.from("visitors").insert([
        {
          name,
          mobile_number: mobile,
          college,
          person_to_meet: personToMeet,
          purpose_of_visit: purpose,
          comment_feedback: feedback,
          latitude,
          longitude,
        },
      ]);

      if (error) {
        alert("Error: " + error.message);
      } else {
        alert("Visitor logged successfully!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Mobile Number</Label>
        <Input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>College</Label>
        <Select onValueChange={setCollege}>
          <SelectTrigger>
            <SelectValue placeholder="Select a college" />
          </SelectTrigger>
          <SelectContent>
            {colleges.map((col) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Person to Meet</Label>
        <Input
          value={personToMeet}
          onChange={(e) => setPersonToMeet(e.target.value)}
        />
      </div>

      <div>
        <Label>Purpose of Visit</Label>
        <Textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </div>

      <div>
        <Label>Comment / Feedback</Label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
