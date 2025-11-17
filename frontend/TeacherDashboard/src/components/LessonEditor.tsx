import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface LessonSection {
  section_type: string;
  title: string;
  content: string;
}

interface LessonEditorProps {
  initialSections?: LessonSection[];
  estimatedDuration?: string;
  onSave: (sections: LessonSection[], estimatedDuration: string) => void;
  onCancel: () => void;
}

const SECTION_TYPES = [
  { value: "introduction", label: "Introduction" },
  { value: "explanation", label: "Explanation" },
  { value: "example", label: "Example" },
  { value: "activity", label: "Activity" },
  { value: "summary", label: "Summary" },
];

export function LessonEditor({
  initialSections = [],
  estimatedDuration = "",
  onSave,
  onCancel,
}: LessonEditorProps) {
  const [sections, setSections] = useState<LessonSection[]>(
    initialSections.length > 0
      ? initialSections
      : [
          {
            section_type: "introduction",
            title: "",
            content: "",
          },
        ]
  );
  const [duration, setDuration] = useState(estimatedDuration);

  const addSection = () => {
    setSections([
      ...sections,
      {
        section_type: "explanation",
        title: "",
        content: "",
      },
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const updateSection = (index: number, field: keyof LessonSection, value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleSave = () => {
    // Filter out empty sections
    const validSections = sections.filter(
      (s) => s.title.trim() !== "" || s.content.trim() !== ""
    );
    if (validSections.length === 0) {
      alert("Please add at least one section with content");
      return;
    }
    onSave(validSections, duration);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Lesson Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estimated Duration */}
        <div>
          <Label htmlFor="duration">Estimated Duration</Label>
          <Input
            id="duration"
            placeholder="e.g., 45 minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Lesson Sections</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {sections.map((section, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Section {index + 1}</Label>
                  {sections.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor={`section-type-${index}`}>Section Type</Label>
                  <select
                    id={`section-type-${index}`}
                    value={section.section_type}
                    onChange={(e) =>
                      updateSection(index, "section_type", e.target.value)
                    }
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {SECTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor={`section-title-${index}`}>Section Title</Label>
                  <Input
                    id={`section-title-${index}`}
                    placeholder="e.g., Introduction to Variables"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(index, "title", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor={`section-content-${index}`}>Content</Label>
                  <Textarea
                    id={`section-content-${index}`}
                    placeholder="Enter section content..."
                    value={section.content}
                    onChange={(e) =>
                      updateSection(index, "content", e.target.value)
                    }
                    rows={6}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave}>Save Lesson</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

