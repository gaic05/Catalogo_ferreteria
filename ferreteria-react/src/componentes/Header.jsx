export const Header = ({ currentSection, setSection, cantidadCarrito = 0 }) => {

  return (
    <header>
      <div>
        <img src="/images/Logo_ferreteria.png" alt="Logo ferreteria los maestros" className="logo" />
      </div>
      
      <nav className="menu-navegacion">
        <span onClick={() => setSection("inicio")} className="enlace-menu">Inicio</span>
        <span onClick={() => setSection("catalogo")} className="enlace-menu">Catalogo</span>
        <span onClick={() => setSection("nosotros")} className="enlace-menu">Nosotros</span>
        <span onClick={() => setSection("contacto")} className="enlace-menu">Contacto</span>
      </nav>

      <div className="boton-registro">
        <span onClick={() => setSection("carrito")} className="enlace-carrito">
          Carrito{' '}
          <span
            id="contadorCarrito"
            className="contador-carrito"
            aria-label="productos en el carrito"
            hidden={cantidadCarrito === 0}
          >
            {cantidadCarrito}
          </span>
        </span>
        <span onClick={() => setSection("registro")} className="enlace-menu">Registrarse</span>
      </div>
    </header>
  );
};
