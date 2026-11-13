import { PROJECT_PREVIEWS } from "./portfolio-previews.js";

const repository = "https://github.com/gnbaeu/postgres-crud";

// One standalone platform and one feature within it, verified in this checkout.
export const PROJECTS = [
  {
    id: "gnwaa", number: "01", title: "GNWAA Platform", kind: "project", icon: "laptop",
    category: "projectPlatformCategory", description: "projectPlatformDescription",
    technologies: ["HTML", "CSS", "JavaScript", "Vite", "Express", "PostgreSQL"],
    features: ["featurePortfolio", "featurePlayground", "featureOwnerCRM"],
    livePage: "home", livePath: "/", casePage: "projectCase", casePath: "/projects/gnwaa",
    source: repository, preview: PROJECT_PREVIEWS.gnwaa,
    study: { overview: "platformText", motivation: "problemText", approach: "approachText", challenges: "challengeText", outcome: "outcomeText" }
  },
  {
    id: "randomizer", number: "02", title: "Randomizer", kind: "feature", parent: "gnwaa", icon: "gamepad",
    category: "projectRandomizerCategory", description: "projectRandomizerDescription",
    technologies: ["JavaScript", "Vite", "Web Crypto", "localStorage"],
    features: ["featureMovieFood", "featureFilters", "featureDraw"],
    livePage: "randomizer", livePath: "/randomizer", casePage: "randomizerCase", casePath: "/projects/randomizer",
    source: repository, preview: PROJECT_PREVIEWS.randomizer,
    study: { overview: "projectRandomizerDescription", motivation: "rzMotivation", approach: "rzApproach", challenges: "rzChallenge", outcome: "rzOutcome" }
  }
];

export const getProject = id => PROJECTS.find(project => project.id === id) || null;
