"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateHoker() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    age: "",
    gender: "",
    address: "",
    state: "",
    district: "",
    tehsil: "",
    village: "",
    pincode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/agent/hokers/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    // reset form
    setForm({
      full_name: "",
      mobile: "",
      email: "",
      age: "",
      gender: "",
      address: "",
      state: "",
      district: "",
      tehsil: "",
      village: "",
      pincode: "",
    });
  };

  return (
    <div className="p-6 w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Hoker</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mobile</Label>
                <Input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value) =>
                    setForm({ ...form, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>State</Label>
                <Input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>District</Label>
                <Input
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tehsil</Label>
                <Input
                  name="tehsil"
                  value={form.tehsil}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Village</Label>
                <Input
                  name="village"
                  value={form.village}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label>Pincode</Label>
              <Input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Hoker"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
