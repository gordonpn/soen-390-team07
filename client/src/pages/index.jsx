import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { push as Menu } from 'react-burger-menu';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import NavBar from '../components/NavBar.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { styles } from '../components/Sidebar.jsx';
import Login from '../components/views/Login.jsx';
import AdminPage from '../components/views/AdminPage.jsx';
import MainDashboard from '../components/views/MainDashboard.jsx';
import { RootStoreContext } from '../stores/stores';

const MenuItems = () => (
  <>
    <Link to="/main">Dashboard</Link>
  </>
);

const Index = observer(() => {
  const { uiStore } = useContext(RootStoreContext);

  return (
    <>
      <BrowserRouter>
        <Menu
          styles={styles}
          pageWrapId={'page-wrap'}
          customBurgerIcon={false}
          customCrossIcon={false}
          isOpen={uiStore.sidebarState}
          onClose={uiStore.toggleSidebarState}
        >
          <MenuItems />
        </Menu>
        <main id="page-wrap">
          <NavBar />
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            <ProtectedRoute path="/main">
              <MainDashboard />
            </ProtectedRoute>
            <Route path="/AdminPage">
              <AdminPage />
            </Route>
          </Switch>
        </main>
      </BrowserRouter>
    </>
  );
});

export default Index;
