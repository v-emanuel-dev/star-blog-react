import { FC } from 'react';

const AboutPage: FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">About the Blog</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
          <p className="mb-4 text-gray-700">
            Welcome to <strong>Star Blog</strong>! Our mission is to share knowledge about modern web development, focusing on React, TypeScript, and best frontend practices.
          </p>
          <p className="text-gray-700">
            We believe that strongly typed code not only prevents errors but also improves documentation and collaboration among developers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Technologies</h2>
          <p className="mb-4 text-gray-700">This blog was built using:</p>
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
