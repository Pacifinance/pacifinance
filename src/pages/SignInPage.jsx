import React, {useEffect, useContext} from 'react';
import { UserContext } from '../contexts/UserContext';
import SignInForm from '../sections/SignInForm';

function SignInPage() {

  const { userData, handleSetIsUpdated } = useContext(UserContext);

  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Chiamata iniziale per caricare i dati dell'utente al caricamento della pagina
  }, []);

  return (
    <div>
      <SignInForm />
    </div>
  );
}

export default SignInPage;