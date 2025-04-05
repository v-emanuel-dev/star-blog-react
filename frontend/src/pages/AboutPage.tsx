import { FC } from "react";

const AboutPage: FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          About Star Blog
        </h1>

        <div className="prose prose-indigo max-w-none text-gray-700 space-y-4">
          <p>
            Welcome to Star Blog! This project showcases modern web development
            techniques found in full-featured blog applications.
          </p>

          <section>
            <h2 className="text-xl font-semibold">Core Blog Features</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>View and read posts on the homepage or individual pages.</li>
              <li>Create posts via a rich editor (for authenticated users).</li>
              <li>Edit and delete your own posts.</li>
              <li>
                Search by title, content, or category with real-time results.
              </li>
              <li>Categories displayed alphabetically per post.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              User Accounts & Authentication
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Register with email and upload an avatar.</li>
              <li>Login via email/password or Google OAuth.</li>
              <li>Edit profile details and change your password.</li>
              <li>
                Restricted access to actions like posting, commenting, and
                liking.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Interactive Features</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authenticated users can comment with name and avatar.</li>
              <li>Edit or delete your own comments.</li>
              <li>Like/unlike posts with visible like count.</li>
              <li>
                Real-time notifications when your post receives a comment.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Technical Stack</h2>
            <p>This project uses a modern web stack:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Frontend: React (TypeScript), Vite, Tailwind CSS, React Router,
                Socket.IO.
              </li>
              <li>
                Backend: Node.js, Express, MySQL, JWT, bcrypt, Passport.js,
                Multer, Socket.IO.
              </li>
              <li>Styling: Tailwind CSS utility-first approach.</li>
            </ul>
          </section>

          <p>
            Explore the blog, register an account, and test all features. View
            the source code on{" "}
            <a
              href="https://github.com/v-emanuel-dev/star-blog-react"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
