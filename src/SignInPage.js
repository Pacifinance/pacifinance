import React from 'react';
import SignInForm from './sections/SignInForm';

function SignInPage() {
  // Matomo Tag Manager
  React.useEffect(() => {
    var _mtm = window._mtm = window._mtm || [];
    _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src='{container_geUS8Fsk.js}'; s.parentNode.insertBefore(g,s);
  }, []);
  
  return (
    <div>
      {/* Altri componenti */}
      <SignInForm />
    </div>
  );
}

export default SignInPage;