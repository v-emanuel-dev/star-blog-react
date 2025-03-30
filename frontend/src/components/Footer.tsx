import { FC } from 'react';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner">
      <div className="container mx-auto text-center text-sm">
        <p>
          &copy; {currentYear} Star Blog | All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
