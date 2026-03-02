import { useNavigate } from "react-router-dom";
import { useState } from "react";

const templates = [
  {
    id: "portfolio",
    name: "Personal Portfolio",
    category: "Personal",
    image: "/templates/portfolio.jpg",
    description: "Modern developer portfolio with hero, skills and projects.",
    prompt: "Create a modern personal portfolio website with hero, about, skills, projects and contact sections using HTML, CSS and JavaScript."
  },
  {
    id: "restaurant",
    name: "Restaurant Website",
    category: "Business",
    image: "/templates/restaurant.jpg",
    description: "Food business website with menu and reservation.",
    prompt: "Create a restaurant website with home, menu, gallery and reservation sections using HTML, CSS and JavaScript."
  },
  {
    id: "realestate",
    name: "Real Estate Website",
    category: "Business",
    image: "/templates/realestate.jpg",
    description: "Property listing website with modern UI.",
    prompt: "Create a real estate website with home, listings, agents and contact sections using HTML, CSS and JavaScript."
  },
  {
    id: "saas",
    name: "SaaS Landing Page",
    category: "Startup",
    image: "/templates/saas.jpg",
    description: "Startup landing page with pricing and testimonials.",
    prompt: "Create a SaaS landing page with features, pricing, testimonials and call-to-action sections using HTML, CSS and JavaScript."
  },
  {
    id: "ecommerce",
    name: "Simple E-Commerce",
    category: "Commerce",
    image: "/templates/ecommerce.jpg",
    description: "Product showcase with cart UI.",
    prompt: "Create a simple e-commerce website with product grid, product details and cart section using HTML, CSS and JavaScript."
  },
  {
    id: "dashboard",
    name: "Admin Dashboard",
    category: "Admin",
    image: "/templates/dashboard.jpg",
    description: "Clean admin dashboard with sidebar and analytics cards.",
    prompt: "Create a modern admin dashboard with sidebar navigation, analytics cards and tables using HTML, CSS and JavaScript."
  },
  {
    id: "gym",
    name: "Gym Website",
    category: "Business",
    image: "/templates/gym.jpg",
    description: "Fitness center website with plans and trainers.",
    prompt: "Create a gym website with hero section, training programs, pricing plans and contact section using HTML, CSS and JavaScript."
  },
  {
    id: "school",
    name: "School Website",
    category: "Education",
    image: "/templates/school.jpg",
    description: "School website with courses and admissions.",
    prompt: "Create a school website with home, courses, faculty and admissions section using HTML, CSS and JavaScript."
  },
  {
    id: "agency",
    name: "Digital Agency",
    category: "Business",
    image: "/templates/agency.jpg",
    description: "Creative agency landing page.",
    prompt: "Create a digital agency website with services, portfolio and contact section using HTML, CSS and JavaScript."
  },
  {
    id: "blog",
    name: "Blog Website",
    category: "Content",
    image: "/templates/blog.jpg",
    description: "Clean blog layout with posts and sidebar.",
    prompt: "Create a blog website layout with posts list, single post view and sidebar using HTML, CSS and JavaScript."
  },
  {
    id: "clinic",
    name: "Clinic Website",
    category: "Healthcare",
    image: "/templates/clinic.jpg",
    description: "Medical clinic website with appointment form.",
    prompt: "Create a medical clinic website with services, doctors section and appointment form using HTML, CSS and JavaScript."
  },
  {
    id: "photography",
    name: "Photography Portfolio",
    category: "Creative",
    image: "/templates/photography.jpg",
    description: "Image gallery focused layout.",
    prompt: "Create a photography portfolio website with gallery grid and contact section using HTML, CSS and JavaScript."
  }
];

function Templates() {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [openPromptId, setOpenPromptId] = useState(null);

  const handleTemplateClick = async (template) => {
    try {
      setLoadingId(template.id);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: template.prompt })
      });

      if (!res.ok) throw new Error("Generation failed");

      const result = await res.json();
      navigate(`/builder?project=${result._id}`);
    } catch (err) {
      console.error(err);
      alert("Template generation failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black p-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Choose a Template
        </h1>

        {/* 🔥 Create Your Own Project Button (Moved to Top) */}
        <button
          onClick={() => navigate("/builder")}
          className="mt-6 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition font-semibold"
        >
          + Create Your Own Project
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition overflow-hidden flex flex-col"
          >
            <img
              src={template.image}
              alt={template.name}
              className="h-48 w-full object-cover"
            />

            <div className="p-6 flex flex-col flex-1">
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full w-fit mb-3">
                {template.category}
              </span>

              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {template.name}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {template.description}
              </p>

              <div className="mt-auto space-y-3">
                <button
                  onClick={() => handleTemplateClick(template)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
                >
                  {loadingId === template.id ? "Generating..." : "Use Template"}
                </button>

                <button
                  onClick={() =>
                    setOpenPromptId(
                      openPromptId === template.id ? null : template.id
                    )
                  }
                  className="text-sm text-indigo-500 hover:underline"
                >
                  {openPromptId === template.id
                    ? "Hide AI Prompt"
                    : "View AI Prompt"}
                </button>

                {openPromptId === template.id && (
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                    {template.prompt}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Templates;