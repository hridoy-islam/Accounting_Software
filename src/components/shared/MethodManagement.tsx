import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Method {
  id: number
  name: string
}

export function MethodManagement() {
  const [methods, setMethods] = useState<Method[]>([])
  const { register, handleSubmit, reset } = useForm<Method>()

  const onSubmit = (data: Method) => {
    const newMethod = { ...data, id: Date.now() }
    setMethods([...methods, newMethod])
    reset()
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Method</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Method Name</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <Button type="submit">Add Method</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {methods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-4">
                  <h3 className="font-bold">{method.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

