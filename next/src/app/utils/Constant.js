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

const coldColorsList = ["#57b9ff", "#0085FF", "#1c41fd"];

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
    name: "Mustard",
    colors: ["#FFD151", "#FFEAAF", "#FFE190", "#FFD970"],
  },
  {
    name: "NamGH",
    colors: ["#9999FF", "#AAC4FF", "#D2DAFF", "#EEF1FF"],
  },
  {
    name: "Summer",
    colors: ["#FFF5E4", "#FFE3E1", "#FFD1D1", "#FF9494"],
  },
  {
    name: "Winter",
    colors: ["#E3FDFD", "#CBF1F5", "#A6E3E9", "#71C9CE"],
  },
  {
    name: "Fall",
    colors: ["#7D5A50", "#B4846C", "#E5B299", "#FCDEC0"],
  },
  {
    name: "Rainbow",
    colors: ["#F38181", "#FCE38A", "#EAFFD0", "#95E1D3"],
  },
];

const PREMIUM = [
  {
    name: 'Advance',
    monthly: {
      cost: 3.99,
      price_id: "price_1PIvJSKJPV0VFcSQWRF1HwWU",
      product_id: "prod_Q9Dk1HcaaIq8fr"
    },
    yearly: {
      cost: 29.99,
      price_id: "price_1PIvKAKJPV0VFcSQFQI9SRIe",
      product_id: "prod_Q9Dlfo9hR9DlgG"
    },
    features: [
      "Advanced Study Analysis: Monitor productivity and progress.",
      "Comparison Features: Compare metrics with friends.",
      "Friend Limit: Up to 10 friends.",
      "Discount on Study Icons: 20% off.",
      "Theme Storage: Up to 10 themes.",
      "Subjects Limit: Track up to 10 subjects.",
      "Daily Email Report: Get daily progress reports.",
      "Groups Limit: Join up to 5 groups.",
    ]
  },
  {
    name: 'Pro',
    monthly: {
      cost: 5.99,
      price_id: "price_1PIvKdKJPV0VFcSQTfpt7cjK",
      product_id: "prod_Q9Dmwyl0DPJNBW"
    },
    yearly: {
      cost: 39.99,
      price_id: "price_1PIvKwKJPV0VFcSQX7nl2Q9H",
      product_id: "prod_Q9DmkG5DQ0hynq"
    },
    features:   [
      "Priority Support: Faster response times.",
      "Comparison Features: Compare metrics with a larger user base.",
      "Friend Limit: Up to 50 friends.",
      "Access to All Study Icons: Free access to all icons.",
      "Theme Storage: Up to 30 themes.",
      "Subjects Limit: Track up to 30 subjects.",
      "Daily Email Report: Detailed progress reports.",
      "Groups Limit: Join up to 20 groups.",
      "Enhanced AI-Driven Learning: Advanced recommendations and personalized plans.",
      "Advanced Timers and Gamification: Enhanced timers and challenges.",
      "Comprehensive Analytics: In-depth study and productivity analysis.",
    ]
  }
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
  subject: null,
  id: null,
  saved: false,
  completed: false,
  type: "local",
  editable: true,
  share: []
}

export {
  colorsList,
  subjectIcons,
  toolsInfo,
  coldColorsList,
  warmColorsList,
  colorPaletteOptions,
  PREMIUM,
  DEFAULT_PLAN
};
