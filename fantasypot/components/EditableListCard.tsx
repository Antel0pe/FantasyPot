import { Edit2 } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { Input } from "./ui/input"

type Props = {
    icon: React.ReactNode
    title: string
    items: string[]
    onChange: (items: string[]) => void
    loading: boolean
    renderItems?: (items: string[]) => React.ReactNode
  }

export function EditableListCard({ icon, title, items, onChange, loading, renderItems }: Props) {
    const [isEditing, setIsEditing] = useState(false)
  
    const handleItemChange = (index: number, value: string) => {
      const newItems = [...items]
      newItems[index] = value
      onChange(newItems)
    }
  
    const handleAddItem = () => {
      onChange([...items, ""])
    }
  
    const handleRemoveItem = (index: number) => {
      const newItems = items.filter((_, i) => i !== index)
      onChange(newItems)
    }
  
    return (
      <Card className="bg-white/10 border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-teal-300">
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
            <Skeleton className="w-full h-[100px] bg-white/10" />
          ) : isEditing ? (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className="bg-transparent border-slate-700 text-slate-100"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-teal-300 border-teal-300 hover:bg-teal-500/20"
              >
                Add Item
              </Button>
            </div>
          ) : renderItems ? (
            renderItems(items)
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm text-slate-300">{item}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    )
  }