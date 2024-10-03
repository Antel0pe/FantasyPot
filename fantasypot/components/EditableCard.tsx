import { Edit2 } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { Input } from "./ui/input"

type Props = {
    icon: React.ReactNode
    title: string
    value?: string
    onChange: (value: string) => void
    loading: boolean
  }

export function EditableCard({ icon, title, value, onChange, loading }: Props) {
    const [isEditing, setIsEditing] = useState(false)
  
    return (
      <Card className="bg-white/10 border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-teal-300">
            {icon}
            {title}
          </CardTitle>
          {!loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="hover:bg-teal-500/20"
            >
              <Edit2 className="h-5 w-5 text-teal-300" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="w-full h-8 bg-white/10" />
          ) : isEditing ? (
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="bg-transparent border-slate-700 text-slate-100"
            />
          ) : (
            <p className="text-2xl font-bold text-slate-100">{value}</p>
          )}
        </CardContent>
      </Card>
    )
  }