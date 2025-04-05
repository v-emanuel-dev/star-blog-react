import {
  faBell,
  faCheckCircle,
  faCommentDots,
  faComments,
  faEdit,
  faNewspaper,
  faPen,
  faSearch,
  faSignInAlt,
  faStar,
  faThumbsUp,
  faUserEdit,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Link } from "react-router-dom";

const AboutPage: FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="flex items-center mb-6">
          <FontAwesomeIcon
            icon={faStar}
            className="text-3xl text-indigo-600 mr-3"
          />
          <h1 className="text-3xl font-bold text-gray-900">About Star Blog</h1>
        </div>

        <div className="prose prose-indigo max-w-none text-gray-700 space-y-4">
          <p>
            Welcome to Star Blog! This platform is a demonstration project built
            with modern web technologies, showcasing a range of features found
            in typical blogging applications.
          </p>

          <section>
            <h2 className="text-xl font-semibold !mt-6 !mb-3">
              Core Blog Features
            </h2>
            <ul className="list-disc list-outside space-y-1 pl-5">
              <li>
                <FontAwesomeIcon
                  icon={faNewspaper}
                  className="mr-2 text-indigo-500"
                />{" "}
                View Posts: Browse all articles on the homepage or view
                individual posts.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faPen}
                  className="mr-2 text-indigo-500"
                />{" "}
                Create Posts: Logged-in users can create new blog posts via a
                dedicated form.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faEdit}
                  className="mr-2 text-indigo-500"
                />{" "}
                Edit & Delete Posts: Authors can edit or delete their own posts.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faSearch}
                  className="mr-2 text-indigo-500"
                />{" "}
                Search: Quickly find posts by searching titles, content, or
                categories with real-time filtering.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="mr-2 text-indigo-500"
                />{" "}
                Category Display: Categories are shown alphabetically on each
                post.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold !mt-6 !mb-3">
              User Accounts & Authentication
            </h2>
            <ul className="list-disc list-outside space-y-1 pl-5">
              <li>
                <FontAwesomeIcon
                  icon={faUsers}
                  className="mr-2 text-indigo-500"
                />{" "}
                Registration: Create an account with email and password,
                including avatar upload.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faSignInAlt}
                  className="mr-2 text-indigo-500"
                />{" "}
                Login: Secure login via email/password or Google OAuth.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faUserEdit}
                  className="mr-2 text-indigo-500"
                />{" "}
                Profile Management: Update name, avatar, and password on your
                profile page.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="mr-2 text-indigo-500"
                />{" "}
                Protected Actions: Only logged-in users can post, comment, or
                like content.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold !mt-6 !mb-3">
              Interactive Features
            </h2>
            <ul className="list-disc list-outside space-y-1 pl-5">
              <li>
                <FontAwesomeIcon
                  icon={faComments}
                  className="mr-2 text-indigo-500"
                />{" "}
                Comments: Authenticated users can comment. Comments show avatar
                and name, sorted newest first.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faCommentDots}
                  className="mr-2 text-indigo-500"
                />{" "}
                Comment Editing/Deletion: Edit or remove your own comments.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faThumbsUp}
                  className="mr-2 text-indigo-500"
                />{" "}
                Likes: Like/unlike posts with a visible like count.
              </li>
              <li>
                <FontAwesomeIcon
                  icon={faBell}
                  className="mr-2 text-indigo-500"
                />{" "}
                Real-time Notifications: Post authors receive instant alerts
                when someone comments on their post.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold !mt-6 !mb-3">
              Technical Stack
            </h2>
            <p>This project utilizes a modern stack including:</p>
            <ul className="list-disc list-outside space-y-1 pl-5">
              <li>
                Frontend: React (TypeScript), Vite, Tailwind CSS, React Router
                DOM, Socket.IO, FontAwesome.
              </li>
              <li>
                Backend: Node.js with Express, MySQL (via mysql2), JWT, bcrypt,
                Passport.js (Google OAuth), Multer, Socket.IO.
              </li>
              <li>Styling: Utility-first with Tailwind CSS.</li>
            </ul>
          </section>

          <p className="!mt-6">
            Explore the blog, create an account, and test the features. Check
            out the code on{" "}
            <Link
              to="https://github.com/v-emanuel-dev/star-blog-react"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
