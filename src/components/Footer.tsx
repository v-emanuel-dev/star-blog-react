import { FC } from 'react';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear(); // Pega o ano atual dinamicamente

  return (
    <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner"> {/* mt-8 adiciona margem acima */}
      <div className="container mx-auto text-center text-sm">
        <p>
          &copy; {currentYear} Star Blog | Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;