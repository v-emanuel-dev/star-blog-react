// src/pages/AboutPage.tsx
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faNewspaper, faUsers, faComments, faBell, faUserEdit, faSignInAlt, faSearch, faThumbsUp, faCheckCircle, faPen, faEdit } from '@fortawesome/free-solid-svg-icons';

const AboutPage: FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="flex items-center mb-6">
        <FontAwesomeIcon icon={faStar} className="text-3xl text-indigo-600 mr-3" />

           <h1 className="text-3xl font-bold text-gray-900">About Star Blog</h1>
        </div>

        <div className="prose prose-indigo max-w-none text-gray-700 space-y-4">
          <p>
            Welcome to Star Blog! This platform is a demonstration project built with modern web technologies, showcasing a range of features found in typical blogging applications.
          </p>

          <h2 className="text-xl font-semibold !mt-6 !mb-3">Core Blog Features</h2>
           <ul className="list-disc list-outside space-y-1 pl-5">
                <li><FontAwesomeIcon icon={faNewspaper} className="mr-2 text-indigo-500" /> View Posts: Browse all articles on the homepage or view individual posts.</li>
                <li><FontAwesomeIcon icon={faPen} className="mr-2 text-indigo-500" /> Create Posts: Logged-in users can create new blog posts via a dedicated form.</li>
                <li><FontAwesomeIcon icon={faEdit} className="mr-2 text-indigo-500" /> Edit & Delete Posts: Authors can edit or delete their own posts directly from the post page.</li>
                <li><FontAwesomeIcon icon={faSearch} className="mr-2 text-indigo-500" /> Search: Quickly find posts by searching titles, content, or categories directly on the homepage with real-time filtering.</li>
                <li>Category Display: Categories are displayed clearly and sorted alphabetically on posts.</li>
          </ul>

          <h2 className="text-xl font-semibold !mt-6 !mb-3">User Accounts & Authentication</h2>
           <ul className="list-disc list-outside space-y-1 pl-5">
                <li><FontAwesomeIcon icon={faUsers} className="mr-2 text-indigo-500" /> Registration: New users can register using email and password, with an option to upload an avatar image.</li>
                <li><FontAwesomeIcon icon={faSignInAlt} className="mr-2 text-indigo-500" /> Login: Secure login via email/password or Google OAuth.</li>
                <li><FontAwesomeIcon icon={faUserEdit} className="mr-2 text-indigo-500" /> Profile Management: Logged-in users have a profile page where they can update their name, avatar, and password.</li>
                <li>Protected Actions: Creating/editing/deleting posts, comments, and liking posts requires users to be logged in.</li>
          </ul>

           <h2 className="text-xl font-semibold !mt-6 !mb-3">Interactive Features</h2>
           <ul className="list-disc list-outside space-y-1 pl-5">
                <li><FontAwesomeIcon icon={faComments} className="mr-2 text-indigo-500" /> Comments: Logged-in users can add comments to posts. Commenters' names and avatars are displayed. Comments are shown newest first.</li>
                <li><FontAwesomeIcon icon={faEdit} className="mr-2 text-indigo-500" /> Comment Editing/Deletion: Users can edit or delete their own comments.</li>
                 <li><FontAwesomeIcon icon={faThumbsUp} className="mr-2 text-indigo-500" /> Likes: Users can like or unlike posts, with the total count displayed.</li>
                <li><FontAwesomeIcon icon={faBell} className="mr-2 text-indigo-500" /> Real-time Notifications: Post authors receive instant notifications (via WebSockets) when another user comments on their post, indicated by a badge on the header's bell icon.</li>
          </ul>

           <h2 className="text-xl font-semibold !mt-6 !mb-3">Technical Stack</h2>
             <p>
                 This project utilizes a modern stack including:
             </p>
            <ul className="list-disc list-outside space-y-1 pl-5">
                 <li>Frontend: React with TypeScript, Vite, Tailwind CSS, React Router DOM, Socket.IO Client, FontAwesome.</li>
                 <li>Backend: Node.js with Express, MySQL (using mysql2), JWT for authentication, bcrypt for password hashing, Passport.js for Google OAuth, Multer for file uploads, Socket.IO.</li>
                 <li>Styling: Primarily utility-first CSS using Tailwind CSS.</li>
            </ul>

            <p className="!mt-6">
                 Feel free to explore the blog, create an account, and try out the features! Check out the code on <Link to="https://github.com/v-emanuel-dev/star-blog-react" className="text-indigo-600 hover:underline">GitHub</Link>.
            </p>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;