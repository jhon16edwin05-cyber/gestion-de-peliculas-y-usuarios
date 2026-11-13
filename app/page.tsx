import { CineDashboard } from '@/components/cine-dashboard'
import { getDashboardData } from './actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await getDashboardData()
  return <CineDashboard initialData={data} />
}
