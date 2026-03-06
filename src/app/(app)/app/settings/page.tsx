"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, User, Settings2, Sparkles } from "lucide-react";

export default function SettingsPage() {
  // Profile
  const [name, setName] = useState("Eric Hernandez");

  // Preferences
  const [units, setUnits] = useState("metric");
  const [goal, setGoal] = useState("maintain");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Gluten", "Shellfish"]);

  // AI toggles
  const [autoExtract, setAutoExtract] = useState(true);
  const [askBeforeSave, setAskBeforeSave] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleSaveProfile() {
    toast.success("Profile saved!");
  }

  function handleSavePreferences() {
    toast.success("Preferences saved!");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your profile, preferences, and AI behaviour.
        </p>
      </div>

      {/* Profile */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                EH
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">eric@example.com</p>
              <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                Change avatar
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value="eric@example.com"
                readOnly
                className="opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <Button size="sm" onClick={handleSaveProfile}>Save profile</Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Units</Label>
              <Select value={units} onValueChange={setUnits}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (g, ml, kg)</SelectItem>
                  <SelectItem value="imperial">Imperial (oz, fl oz, lb)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cut">Cut (lose weight)</SelectItem>
                  <SelectItem value="maintain">Maintain</SelectItem>
                  <SelectItem value="bulk">Bulk (gain muscle)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dislikes & Allergies</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add allergy or dislike…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                className="h-8 text-sm flex-1"
              />
              <Button variant="outline" size="sm" onClick={addTag} className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>

          <Button size="sm" onClick={handleSavePreferences}>Save preferences</Button>
        </CardContent>
      </Card>

      {/* AI Preferences */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" /> AI Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              id: "auto-extract",
              label: "Auto-extract nutrition from journal",
              description: "Automatically parse nutrition data when you log a meal via natural language.",
              value: autoExtract,
              set: setAutoExtract,
            },
            {
              id: "ask-before-save",
              label: "Ask before saving parsed meals",
              description: "Show a confirmation step before saving AI-parsed meals to your history.",
              value: askBeforeSave,
              set: setAskBeforeSave,
            },
          ].map(({ id, label, description, value, set }) => (
            <div key={id} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
              <Switch
                id={id}
                checked={value}
                onCheckedChange={set}
                className="shrink-0 mt-0.5"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
