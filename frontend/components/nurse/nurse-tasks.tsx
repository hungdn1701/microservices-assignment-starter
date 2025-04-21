import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, MoreHorizontal, User } from "lucide-react"

export default function NurseTasks() {
  const tasks = [
    {
      id: 1,
      patient: "Robert Davis",
      patientId: "P-1008",
      task: "Administer medication",
      time: "08:00 AM",
      status: "Pending",
      priority: "High",
    },
    {
      id: 2,
      patient: "Jennifer Lee",
      patientId: "P-1012",
      task: "Check vital signs",
      time: "08:15 AM",
      status: "Completed",
      priority: "Medium",
    },
    {
      id: 3,
      patient: "Michael Brown",
      patientId: "P-1002",
      task: "Assist with bathing",
      time: "08:30 AM",
      status: "Pending",
      priority: "Low",
    },
    {
      id: 4,
      patient: "Sophia Garcia",
      patientId: "P-1005",
      task: "Change dressing",
      time: "09:00 AM",
      status: "Pending",
      priority: "High",
    },
  ]

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Checkbox id={`task-${task.id}`} />
            <div className="grid gap-1.5">
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`task-${task.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {task.task}
                </label>
                <Badge
                  variant={
                    task.priority === "High" ? "destructive" : task.priority === "Medium" ? "outline" : "secondary"
                  }
                >
                  {task.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>{task.patient}</span>
                <Clock className="h-3.5 w-3.5" />
                <span>{task.time}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 md:mt-0">
            <Button variant="outline" size="sm">
              Details
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
