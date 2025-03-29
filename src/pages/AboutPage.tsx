// src/pages/AboutPage.tsx
import { FC } from 'react';

const AboutPage: FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Adicionada cor escura */}
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Sobre o Blog</h1>

        <section className="mb-8">
          {/* Adicionada cor escura */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Nossa Missão</h2>
          {/* Adicionada cor escura */}
          <p className="mb-4 text-gray-700">
            Bem-vindo ao <strong>Star Blog</strong>! Nossa missão é compartilhar
            conhecimento sobre desenvolvimento web moderno, com foco em React, TypeScript,
            e as melhores práticas de frontend.
          </p>
          {/* Adicionada cor escura */}
          <p className="text-gray-700">
            Acreditamos que o código com tipagem forte não apenas previne erros, mas também
            melhora a documentação e a colaboração entre desenvolvedores.
          </p>
        </section>

        <section className="mb-8">
           {/* Adicionada cor escura */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tecnologias</h2>
           {/* Adicionada cor escura */}
          <p className="mb-4 text-gray-700">Este blog foi construído usando:</p>
           {/* Adicionada cor escura aos itens da lista */}
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>React 18</li>
            <li>TypeScript 5</li>
            <li>Vite</li>
            <li>React Router</li>
            <li>Tailwind CSS</li>
            <li>Context API</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;