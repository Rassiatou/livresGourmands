function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container text-center small">
        <div>© {new Date().getFullYear()} LivresGourmands.net</div>
        <div>Projet pédagogique – Programmation Web avancée</div>
      </div>
    </footer>
  );
}

export default Footer;
