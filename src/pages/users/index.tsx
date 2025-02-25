import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { UserTable } from './components/UserTable';


export default function UserPage() {
  // const [refreshKey, setRefreshKey] = useState(0);

  // const handleUserCreated = () => {
  //   setRefreshKey((prev) => prev + 1); // Update the key to trigger re-fetch
  // };
  return (
    <div className=" rounded-lg  ">
      
      {/* <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/admin' },
          { title: 'Users', link: '/users' }
        ]}
      /> */}
      {/* <CreateUser onUserCreated={handleUserCreated} /> */}
      {/* <UserTableList refreshKey={refreshKey} /> */}
      <UserTable />
    </div>
  );
}
