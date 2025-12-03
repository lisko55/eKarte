'use client'; // Ostaje jer imate Date() i bit će interaktivan (ili želite da bude)

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Automatski dohvaća trenutnu godinu

  return (
    // Ovdje sam dodao Tailwind klase. Prilagodite ih po želji.
    // bg-gray-900: Tamno siva pozadina
    // text-white: Bijeli tekst
    // py-4: Padding po Y osi (gore/dolje)
    // text-center: Centriran tekst
    // text-sm: Mala veličina teksta
    // mt-auto: Vrlo bitno! Ovo "gura" footer na dno ako je flex-col roditelj
    <footer className="bg-gray-900 text-white py-4 text-center text-sm mt-auto">
      <div className="container mx-auto"> {/* container mx-auto za centriranje sadržaja unutar footera */}
        <p>eKarte &copy; {currentYear} | Sva prava pridržana</p>
        {/* Ovdje kasnije možete dodati linkove, npr. "O nama", "Kontakt", itd. */}
      </div>
    </footer>
  );
};

export default Footer;