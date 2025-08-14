import { UserInfo } from "@/components/debug/user-info"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Debug Information</h1>
          <p className="text-gray-600 mt-2">Use this page to debug user authentication and admin permissions.</p>
        </div>

        <UserInfo />
      </div>
    </div>
  )
}
