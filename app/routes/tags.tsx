import { Outlet } from 'remix'
import Layout from '~/components/Layout'

export default function TagsPage() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
