import { observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import { RootStoreContext } from 'stores/stores.jsx';
import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, ...rest }) => {
  const { userStore } = useContext(RootStoreContext);

  return (
    <>
      {userStore.loggedIn ? (
        allowedRoles?.includes(userStore.role) ? (
          <Route {...rest} />
        ) : (
          <Redirect to={{ pathname: '/no-access' }} />
        )
      ) : (
        <Redirect to={{ pathname: '/login' }} />
      )}
    </>
  );
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default observer(ProtectedRoute);
