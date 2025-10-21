"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";

// (Your Tag interface)
interface Tag {
  id: string;
  name: string;
  color: string;
}

interface DailySummary {
  date: string; // Assumed to be "YYYY-MM-DD"
  weight: number;
  tagWeights: { [tagId: string]: number };
}

type DayData = DailySummary | null | "future";

interface ContributionHeatmapProps {
  data: DailySummary[];
}

// Helper function to get local YYYY-MM-DD
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [weeks, setWeeks] = useState<Array<Array<DayData>>>([]);
  const [monthLabels, setMonthLabels] = useState<
    Array<{ name: string; weekIndex: number }>
  >([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      const res = await fetch("/api/tags");
      const data = await res.json();
      setAllTags(data);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (!isMounted || !Array.isArray(data)) return;

    const dataMap = new Map(data.map((d) => [d.date, d]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const firstDate = new Date(startDate);
    const day = firstDate.getDay();
    const diff = firstDate.getDate() - day;
    firstDate.setDate(diff);

    const allWeeks: Array<Array<DayData>> = [];
    const currentDate = new Date(firstDate);

    while (currentDate <= today) {
      const currentWeek: Array<DayData> = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = getLocalDateString(currentDate);

        if (currentDate > today) {
          currentWeek.push("future");
        } else if (currentDate >= startDate) {
          const summary = dataMap.get(dateStr);
          currentWeek.push(
            summary || { date: dateStr, weight: 0, tagWeights: {} }
          );
        } else {
          currentWeek.push(null);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      allWeeks.push(currentWeek);
    }

    setWeeks(allWeeks);

    // ...
    // Find the first and last date that has data
    const firstValidWeek = allWeeks.findIndex((week) =>
      week.some((day) => day && day !== "future")
    );

    const lastValidWeek = [...allWeeks]
      .reverse()
      .findIndex((week) => week.some((day) => day && day !== "future"));

    const actualWeeks = allWeeks.slice(
      firstValidWeek,
      allWeeks.length - lastValidWeek
    );

    // Generate month labels
    const labels: Array<{ name: string; weekIndex: number }> = [];
    let currentMonth: number | null = null;

    actualWeeks.forEach((week, weekIndex) => {
      for (const day of week) {
        if (!day || day === "future") continue;

        const [y, m, d] = day.date.split("-").map(Number);
        const month = m - 1; // JavaScript months are 0-based

        if (currentMonth !== month) {
          labels.push({
            name: new Date(y, month).toLocaleString("default", {
              month: "short",
            }),
            weekIndex: weekIndex + firstValidWeek,
          });
          currentMonth = month;
          break;
        }
      }
    });

    setMonthLabels(labels);
    // ...
  }, [data, isMounted]);

  const getColor = (day: DayData) => {
    if (!day || day === "future" || !day.tagWeights) return "bg-muted";

    const total = Object.values(day.tagWeights).reduce((a, b) => a + b, 0);
    if (total === 0) return "bg-muted";
    if (total <= 2) return "bg-green-200 dark:bg-green-900";
    if (total <= 5) return "bg-green-400 dark:bg-green-700";
    if (total <= 8) return "bg-green-600 dark:bg-green-600";
    return "bg-green-800 dark:bg-green-500";
  };

  if (!isMounted) {
    return null;
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-1">
          <div className="flex flex-col gap-[2px] pt-6">
            {dayLabels.map((label) => (
              <div
                key={label}
                className="w-5 h-5 flex items-center justify-center text-[10px] text-muted-foreground"
              >
                {label[0]}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <div className="flex" style={{ paddingLeft: "2px" }}>
              {monthLabels.map((month, index) => {
                const nextMonthWeekIndex = monthLabels[index + 1]?.weekIndex;
                const lastWeekWithData = weeks.findIndex((week) =>
                  week.some((day) => day === "future")
                );

                const endWeekIndex =
                  nextMonthWeekIndex ??
                  (lastWeekWithData !== -1 ? lastWeekWithData : weeks.length);

                const numWeeks = endWeekIndex - month.weekIndex;
                const monthWidth = numWeeks * 24; // (20px cell + 4px gap) * weeks - last gap

                const style = {
                  minWidth: monthWidth,
                  paddingLeft: index === 0 ? 0 : 8, // Add padding between months
                };

                return (
                  <div
                    key={month.name}
                    style={style}
                    className="text-xs text-muted-foreground mb-1"
                  >
                    {month.name}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => {
                        if (day === "future") {
                          return (
                            <div
                              key={`${weekIndex}-${dayIndex}`}
                              className="w-5 h-5"
                            />
                          );
                        }
    
                        // Handle null days (before start date) by rendering an empty cell
                        if (!day) {
                          return (
                            <div
                              key={`${weekIndex}-${dayIndex}`}
                              className="w-5 h-5"
                            />
                          );
                        }
    
                        return (
                          <Popover key={`${weekIndex}-${dayIndex}`}>
                            <Tooltip delayDuration={50}>
                              <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                  <div
                                    className={`w-5 h-5 rounded-sm border border-border cursor-pointer transition-all hover:ring-1 hover:ring-primary ${getColor(
                                      day
                                    )}`}
                                  />
                                </PopoverTrigger>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                {new Date(
                                  day.date.replace(/-/g, "/")
                                ).toLocaleDateString(undefined, {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </TooltipContent>
                            </Tooltip>
                            {day && day.weight > 0 && (
                              <PopoverContent className="w-80">
                                <Card>
                                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Sparkles className="h-8 w-8 text-yellow-400" />
                                    <div>
                                      <CardTitle className="text-xl font-bold">
                                        Level Up!
                                      </CardTitle>
                                      <CardDescription>
                                        You earned{" "}
                                        {Object.values(day.tagWeights || {}).reduce(
                                          (a, b) => a + b,
                                          0
                                        )}{" "}
                                        XP on{" "}
                                        {new Date(
                                          day.date.replace(/-/g, "/")
                                        ).toLocaleDateString()}
                                      </CardDescription>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <p className="font-bold">XP Breakdown:</p>
                                      {Object.entries(day.tagWeights || {}).map(
                                        ([tagId, weight]) => {
                                          const tag = allTags.find(
                                            (t) => t.id === tagId
                                          );
                                          if (!tag) return null;
                                          const percentage =
                                            (weight / day.weight) * 100;
                                          return (
                                            <div key={tagId}>
                                              <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">
                                                  {tag.name}
                                                </span>
                                                <span>{weight} XP</span>
                                              </div>
                                              <div className="h-2 w-full rounded-full bg-primary/20 overflow-hidden">
                                                <div
                                                  className="h-full rounded-full transition-all"
                                                  style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: tag.color,
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                    <div className="mt-4 text-center text-xs text-muted-foreground italic">
                                      "The journey of a thousand miles begins with a
                                      single step."
                                    </div>
                                  </CardContent>
                                </Card>
                              </PopoverContent>
                            )}
                          </Popover>
                        );
                      })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900" />
            <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-700" />
            <div className="w-3 h-3 rounded bg-green-600 dark:bg-green-600" />
            <div className="w-3 h-3 rounded bg-green-800 dark:bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
