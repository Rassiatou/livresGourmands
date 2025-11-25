function ErrorMessage({ message }) {
  return (
    <div className="alert alert-danger my-4" role="alert">
      {message || "Une erreur est survenue."}
    </div>
  );
}

export default ErrorMessage;
