//import { Alert, Article, Book, Coding, Globe, IconCalculator, IconFileBarGraphFill, IconPeriodicTable, IconWhiteboard, Microscope, Workout, WritePen } from "@/app/utils/Svg";
import React from "react";
import {
  Alert,
  Article,
  Book,
  Coding,
  Globe,
  Microscope,
  Workout,
  WritePen,
  IconCalculator,
  IconFileBarGraphFill,
  IconPeriodicTable,
  IconWhiteboard,
} from "./Svg";

const colorsList = [
  "#0395f9",
  "#3fc2ff",
  "#ff6844",
  "#82d795",
  "#705dc1",
  "#ffee65",
  "#beb9db",
  "#fdcce5",
  "#8bd3c7",
  "#e60049",
  "#0bb4ff",
  "#50e991",
  "#e6d800",
  "#9b19f5",
  "#ffa300",
  "#dc0ab4",
  "#b3d4ff",
  "#00bfa0",
];

const coldColorsList = [
  "#b3e5ff", // Light Blue
  "#80d8ff", // Sky Blue Light
  "#4fc3f7", // Blue Light
  "#29b6f6", // Light Bright Blue
  "#03a9f4", // Light Medium Blue
  "#57b9ff", // Sky Blue
  "#039be5", // Medium Blue
  "#0085FF", // Vivid Blue
  "#0288d1", // Darker Blue
  "#0277bd", // Dark Blue
  "#01579b", // Dark Deep Blue
  "#1c41fd", // Deep Blue
  "#0000FF", // Pure Blue
  "#001f3f", // Dark Navy Blue
  "#00132d", // Very Dark Blue
];

const warmColorsList = ["#fff9eb", "#fe8912", "#f9c051"];

const subjectIcons = {
  Book: <Book />,
  Coding: <Coding />,
  Microscope: <Microscope />,
  WritePen: <WritePen />,
  Article: <Article />,
  Globe: <Globe />,
  Workout: <Workout />,
  Alert: <Alert />,
};

const toolsInfo = [
  {
    name: "Scientific Calculator",
    icon: <IconCalculator />,
  },
  {
    name: "Graphing Calculator",
    icon: <IconFileBarGraphFill />,
  },
  {
    name: "Periodic Table of Elements",
    icon: <IconPeriodicTable />,
  },
  {
    name: "Whiteboard",
    icon: <IconWhiteboard />,
  },
];

const colorPaletteOptions = [
  {
    name: "Sky Blue",
    colors: ["#D9F0FF", "#A3D5FF", "#83C9F4", "#6F73D2"],
  },
  {
    name: "Polaroid",
    colors: ["#F8E16C", "#00C49A", "#FB8F67", "#156064"],
  },
  {
    name: "Retro",
    colors: ["#FCAB10", "#F8333C", "#44AF69", "#2B9EB3"],
  },
  {
    name: "Winter",
    colors: ["#393D3F", "#FDFDFF", "#C6C5B9", "#546A7B"],
  },
  {
    name: "No man's land",
    colors: ["#93A3B1", "#7C898B", "#636564", "#4C443C"],
  },
  {
    name: "Cream",
    colors: ["#4C5760", "#93A8AC", "#D7CEB2", "#A59E8C"],
  },
];

const PREMIUM = [
  {
    name: "Advance",
    monthly: {
      cost: 3.99,
      price_id: "price_1PIvJSKJPV0VFcSQWRF1HwWU",
      product_id: "prod_Q9Dk1HcaaIq8fr",
    },
    yearly: {
      cost: 29.99,
      price_id: "price_1PIvKAKJPV0VFcSQFQI9SRIe",
      product_id: "prod_Q9Dlfo9hR9DlgG",
    },
    features: [
      "Advanced Study Analysis: Monitor productivity and progress.",
      "Comparison Features: Compare metrics with friends.",
      "Friend Limit: Up to 10 friends.",
      "Discount on Study Icons: 20% off.",
      "Theme Storage: Up to 10 themes.",
      "Subjects Limit: Track up to 10 subjects.",
      "day Email Report: Get daily progress reports.",
      "Groups Limit: Join up to 5 groups.",
    ],
  },
  {
    name: "Pro",
    monthly: {
      cost: 5.99,
      price_id: "price_1PIvKdKJPV0VFcSQTfpt7cjK",
      product_id: "prod_Q9Dmwyl0DPJNBW",
    },
    yearly: {
      cost: 39.99,
      price_id: "price_1PIvKwKJPV0VFcSQX7nl2Q9H",
      product_id: "prod_Q9DmkG5DQ0hynq",
    },
    features: [
      "Priority Support: Faster response times.",
      "Comparison Features: Compare metrics with a larger user base.",
      "Friend Limit: Up to 50 friends.",
      "Access to All Study Icons: Free access to all icons.",
      "Theme Storage: Up to 30 themes.",
      "Subjects Limit: Track up to 30 subjects.",
      "day Email Report: Detailed progress reports.",
      "Groups Limit: Join up to 20 groups.",
      "Enhanced AI-Driven Learning: Advanced recommendations and personalized plans.",
      "Advanced Timers and Gamification: Enhanced timers and challenges.",
      "Comprehensive Analytics: In-depth study and productivity analysis.",
    ],
  },
];

const DEFAULT_PLAN = {
  opened: false,
  title: "",
  description: "",
  start: new Date(),
  end: new Date(new Date().getTime() + 60 * 1000 * 30),
  repeat: 0,
  priority: 50,
  notification: -1,
  subject_id: null,
  plan_id: null,
  saved: false,
  completed: false,
  type: "local",
  editable: true,
  share: [],
  shared: [],
};

const DEFAULT_GROUP = {
  name: "",
  max_members: 10,
  color: "#000000",
  tags: [],
  description: "",
  visibility: 1,
  password: "",
  goal_hr: 3,
};

const SUBJECTS_PIE_COLORS = [
  "#0395f9",
  "#3fc2ff",
  "#ff6844",
  "#82d795",
  "#705dc1",
  "#ffee65",
  "#beb9db",
  "#fdcce5",
  "#8bd3c7",
  "#e60049",
  "#0bb4ff",
  "#50e991",
  "#e6d800",
  "#9b19f5",
  "#ffa300",
  "#dc0ab4",
  "#b3d4ff",
  "#00bfa0",
];

const STUDY_TREND_COLORS = [
  "#0395f9",
  "#3fc2ff",
  "#ff6844",
  "#82d795",
  "#705dc1",
  "#ffee65",
  "#beb9db",
  "#fdcce5",
  "#8bd3c7",
  "#e60049",
  "#0bb4ff",
  "#50e991",
  "#e6d800",
  "#9b19f5",
  "#ffa300",
  "#dc0ab4",
  "#b3d4ff",
  "#00bfa0",
];

export {
  colorsList,
  subjectIcons,
  toolsInfo,
  coldColorsList,
  warmColorsList,
  colorPaletteOptions,
  PREMIUM,
  DEFAULT_PLAN,
  DEFAULT_GROUP,
  SUBJECTS_PIE_COLORS,
  STUDY_TREND_COLORS,
};
