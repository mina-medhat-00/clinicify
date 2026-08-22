function Footer() {
  return (
    <div className="footer py-4 border bg-blue-600/80">
      <p className="text-white text-sm">
        &copy; {new Date().getFullYear()} Clinicify. All rights reserved.
      </p>
    </div>
  );
}

export default Footer;
