import React, { useState, useReducer, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import gameContent from './gameContent.json';

// ==================== DATA ====================

const GENRES = ['Drama', 'Action', 'Comedy', 'Horror', 'Sci-Fi', 'Thriller', 'Animation', 'Documentary', 'Romance', 'Fantasy', 'Musical', 'Western', 'War', 'Mystery', 'Sports'];

const TONES = [
  { id: 'serious', name: 'Serious', desc: 'Grounded and dramatic', criticMod: 5, audienceMod: -3, marketingMod: 0 },
  { id: 'lighthearted', name: 'Lighthearted', desc: 'Fun and accessible', criticMod: -3, audienceMod: 5, marketingMod: 0.05 },
  { id: 'dark', name: 'Dark', desc: 'Gritty and intense', criticMod: 8, audienceMod: -8, marketingMod: -0.05 },
  { id: 'inspirational', name: 'Inspirational', desc: 'Uplifting and hopeful', criticMod: 0, audienceMod: 8, marketingMod: 0.03 },
  { id: 'satirical', name: 'Satirical', desc: 'Sharp social commentary', criticMod: 10, audienceMod: -5, marketingMod: -0.03 },
  { id: 'experimental', name: 'Experimental', desc: 'Avant-garde and bold', criticMod: 12, audienceMod: -12, marketingMod: -0.1 },
];

const FILM_THEMES = [
  { id: 'redemption', name: 'Redemption', desc: 'A fallen character seeks a second chance', genreBonus: ['Drama', 'War', 'Western', 'Sports'], audienceMod: 5, criticMod: 3, trendEras: [1970, 2200] },
  { id: 'love', name: 'Love & Relationships', desc: 'The power and complexity of human connection', genreBonus: ['Romance', 'Comedy', 'Drama', 'Musical'], audienceMod: 6, criticMod: 0, trendEras: [1970, 2200] },
  { id: 'power', name: 'Power & Corruption', desc: 'The seduction and cost of authority', genreBonus: ['Thriller', 'Drama', 'War', 'Mystery'], audienceMod: 2, criticMod: 6, trendEras: [1970, 2200] },
  { id: 'identity', name: 'Identity & Self-Discovery', desc: 'Who am I and where do I belong?', genreBonus: ['Drama', 'Sci-Fi', 'Fantasy', 'Animation'], audienceMod: 3, criticMod: 5, trendEras: [1990, 2200] },
  { id: 'survival', name: 'Survival', desc: 'Against impossible odds, the will to live', genreBonus: ['Action', 'Horror', 'Thriller', 'War'], audienceMod: 7, criticMod: 1, trendEras: [1970, 2200] },
  { id: 'justice', name: 'Justice & Revenge', desc: 'Righting wrongs through law or force', genreBonus: ['Action', 'Thriller', 'Western', 'Mystery'], audienceMod: 5, criticMod: 2, trendEras: [1970, 2200] },
  { id: 'family', name: 'Family & Legacy', desc: 'Bonds across generations and what we inherit', genreBonus: ['Drama', 'Animation', 'Comedy', 'Fantasy'], audienceMod: 6, criticMod: 3, trendEras: [1970, 2200] },
  { id: 'comingOfAge', name: 'Coming of Age', desc: 'The transition from youth to adulthood', genreBonus: ['Drama', 'Comedy', 'Romance', 'Animation'], audienceMod: 5, criticMod: 4, trendEras: [1970, 2200] },
  { id: 'isolation', name: 'Isolation & Loneliness', desc: 'The weight of being alone in the world', genreBonus: ['Horror', 'Sci-Fi', 'Drama', 'Thriller'], audienceMod: -1, criticMod: 8, trendEras: [1970, 2200] },
  { id: 'ambition', name: 'Ambition & Hubris', desc: 'Reaching too high and paying the price', genreBonus: ['Drama', 'Thriller', 'Sci-Fi', 'Sports'], audienceMod: 3, criticMod: 6, trendEras: [1970, 2200] },
  { id: 'classStruggle', name: 'Class & Inequality', desc: 'The haves versus the have-nots', genreBonus: ['Drama', 'Documentary', 'Thriller', 'Comedy'], audienceMod: 2, criticMod: 7, trendEras: [1980, 2200] },
  { id: 'technology', name: 'Technology & Humanity', desc: 'What happens when machines reshape life', genreBonus: ['Sci-Fi', 'Thriller', 'Documentary', 'Action'], audienceMod: 4, criticMod: 5, trendEras: [1995, 2200] },
  { id: 'faith', name: 'Faith & Belief', desc: 'Questioning or affirming what cannot be proven', genreBonus: ['Drama', 'Fantasy', 'War', 'Mystery'], audienceMod: 4, criticMod: 4, trendEras: [1970, 2200] },
  { id: 'freedom', name: 'Freedom & Rebellion', desc: 'Breaking chains and defying authority', genreBonus: ['Action', 'War', 'Sci-Fi', 'Western'], audienceMod: 6, criticMod: 3, trendEras: [1970, 2200] },
  { id: 'sacrifice', name: 'Sacrifice & Duty', desc: 'Giving up everything for something greater', genreBonus: ['War', 'Drama', 'Action', 'Fantasy'], audienceMod: 5, criticMod: 5, trendEras: [1970, 2200] },
  { id: 'deception', name: 'Deception & Betrayal', desc: 'Trust shattered by lies', genreBonus: ['Thriller', 'Mystery', 'Drama', 'Horror'], audienceMod: 4, criticMod: 4, trendEras: [1970, 2200] },
  { id: 'nature', name: 'Nature & Environment', desc: 'Humanity\'s relationship with the natural world', genreBonus: ['Documentary', 'Sci-Fi', 'Animation', 'Drama'], audienceMod: 3, criticMod: 5, trendEras: [2000, 2200] },
  { id: 'grief', name: 'Grief & Loss', desc: 'Processing the unimaginable', genreBonus: ['Drama', 'Horror', 'Romance', 'Fantasy'], audienceMod: 1, criticMod: 8, trendEras: [1970, 2200] },
  { id: 'exploration', name: 'Exploration & Discovery', desc: 'Venturing into the unknown', genreBonus: ['Sci-Fi', 'Fantasy', 'Action', 'Documentary'], audienceMod: 6, criticMod: 2, trendEras: [1970, 2200] },
  { id: 'absurdity', name: 'Absurdity & Satire', desc: 'The world is ridiculous — lean into it', genreBonus: ['Comedy', 'Sci-Fi', 'Animation', 'Horror'], audienceMod: 3, criticMod: 6, trendEras: [1970, 2200] },
];

const BUDGET_CATEGORIES = [
  { id: 'cast', name: 'Cast', desc: 'Star salaries & supporting roles', qualityWeight: 0.15, color: 'bg-blue-500' },
  { id: 'vfx', name: 'VFX', desc: 'Visual effects & CGI', qualityWeight: 0.12, color: 'bg-purple-500' },
  { id: 'production', name: 'Production', desc: 'Sets, locations, crew', qualityWeight: 0.18, color: 'bg-green-500' },
  { id: 'music', name: 'Music', desc: 'Score & soundtrack', qualityWeight: 0.08, color: 'bg-pink-500' },
  { id: 'editing', name: 'Editing', desc: 'Post-production polish', qualityWeight: 0.10, color: 'bg-orange-500' },
];

const CAREER_PHASES = [
  { id: 'rising', name: 'Rising', minAge: 18, maxAge: 29, skillMod: 2, salaryMod: 0.7, desc: 'Hungry and improving' },
  { id: 'peak', name: 'Peak', minAge: 30, maxAge: 44, skillMod: 0, salaryMod: 1.0, desc: 'At the top of their game' },
  { id: 'veteran', name: 'Veteran', minAge: 45, maxAge: 59, skillMod: -1, salaryMod: 1.2, desc: 'Experienced but slowing' },
  { id: 'legend', name: 'Legend', minAge: 60, maxAge: 74, skillMod: -3, salaryMod: 0.9, desc: 'Icon status, selective roles' },
  { id: 'declining', name: 'Declining', minAge: 75, maxAge: 999, skillMod: -6, salaryMod: 0.5, desc: 'Past their prime' },
];

const MARKETING_PHASES = [
  { id: 'teaser', name: 'Teaser Campaign', desc: 'Build early mystery and awareness', cost: 0.15, buzzMult: 0.8, criticMod: 0, audienceMod: 2 },
  { id: 'trailer', name: 'Full Trailer', desc: 'Showcase the film to the masses', cost: 0.30, buzzMult: 1.2, criticMod: 0, audienceMod: 4 },
  { id: 'pressTour', name: 'Press Tour', desc: 'Cast interviews and media blitz', cost: 0.25, buzzMult: 1.0, criticMod: 3, audienceMod: 2 },
  { id: 'social', name: 'Social Media Push', desc: 'Viral clips, influencer partnerships', cost: 0.20, buzzMult: 1.3, criticMod: -2, audienceMod: 6 },
  { id: 'premiere', name: 'Red Carpet Premiere', desc: 'Star-studded launch event', cost: 0.10, buzzMult: 0.6, criticMod: 4, audienceMod: 3 },
];

const SCENARIOS = [
  { id: 'sandbox', name: 'Sandbox', desc: 'Classic freeplay — build your empire from scratch.', startYear: 1970, startCash: 5000000, startRep: 20, startPres: 10, goal: null, goalDesc: 'No victory condition — play as long as you want.' },
  { id: 'studio_rescue', name: 'Studio Rescue', desc: 'Take over a failing studio drowning in debt.', startYear: 1995, startCash: -2000000, startRep: 8, startPres: 5, startLoans: [{ amount: 20000000, interest: 0.015, termMonths: 60, monthsLeft: 60, monthlyPayment: Math.round(20000000 / 60) }], goal: { type: 'cash', target: 50000000, years: 15 }, goalDesc: 'Reach $50M cash within 15 years.' },
  { id: 'award_hunter', name: 'Award Hunter', desc: 'Win prestige and critical acclaim.', startYear: 1980, startCash: 5000000, startRep: 30, startPres: 20, goal: { type: 'awards', target: 20, years: 20 }, goalDesc: 'Win 20 awards within 20 years.' },
  { id: 'franchise_king', name: 'Franchise King', desc: 'Build a franchise empire.', startYear: 1985, startCash: 10000000, startRep: 25, startPres: 15, goal: { type: 'franchises', target: 5, years: 25 }, goalDesc: 'Build 5 franchises within 25 years.' },
  { id: 'genre_master', name: 'Genre Master', desc: 'Prove you can succeed in every genre.', startYear: 1970, startCash: 3000000, startRep: 20, startPres: 10, goal: { type: 'genreMaster', target: 15, years: 50 }, goalDesc: 'Release a profitable film in all 15 genres.' },
  { id: 'speed_mogul', name: 'Speed Mogul', desc: 'From nothing to $1B as fast as possible.', startYear: 2000, startCash: 3000000, startRep: 15, startPres: 5, goal: { type: 'cash', target: 1000000000, years: 30 }, goalDesc: 'Reach $1B cash within 30 years.' },
];

// ==================== SCRIPT REWRITE OPTIONS ====================
const REWRITE_TYPES = [
  { id: 'polish', name: 'Script Polish', costPct: 0.05, months: 0, qualityMin: 2, qualityMax: 5, desc: 'Light dialogue and scene cleanup. Quick and cheap.', maxUses: 3 },
  { id: 'restructure', name: 'Story Restructure', costPct: 0.12, months: 1, qualityMin: 5, qualityMax: 10, desc: 'Rework act structure and pacing. Adds a month.', maxUses: 2 },
  { id: 'pageOne', name: 'Page-One Rewrite', costPct: 0.25, months: 2, qualityMin: 8, qualityMax: 18, desc: 'Start the script from scratch. Expensive and risky but transformative.', maxUses: 1 },
  { id: 'punchUp', name: 'Comedy Punch-Up', costPct: 0.08, months: 0, qualityMin: 3, qualityMax: 7, desc: 'Hire comedy writers to sharpen humor. Best for Comedy/Romance.', maxUses: 2, genreBonus: ['Comedy', 'Romance', 'Animation'] },
  { id: 'doctorScript', name: 'Script Doctor', costPct: 0.15, months: 1, qualityMin: 6, qualityMax: 12, desc: 'Bring in an uncredited expert to fix problems.', maxUses: 1 },
];

const TEST_SCREENING_OPTIONS = [
  { id: 'focus_group', name: 'Focus Group', cost: 250000, accuracy: 0.6, desc: 'Small audience panel. Cheap but imprecise.' },
  { id: 'test_screening', name: 'Test Screening', cost: 750000, accuracy: 0.8, desc: 'Full theater audience with feedback cards.' },
  { id: 'advanced_analytics', name: 'Advanced Analytics', cost: 1500000, accuracy: 0.95, desc: 'AI-driven audience analysis. Near-perfect prediction.' },
];
const RESHOOT_OPTIONS = [
  { id: 'minor', name: 'Minor Reshoots', costPct: 0.10, months: 1, qualityRange: [2, 6], desc: 'Fix specific scenes. Low cost, modest improvement.' },
  { id: 'major', name: 'Major Reshoots', costPct: 0.25, months: 2, qualityRange: [5, 15], desc: 'Rebuild key sequences. Expensive but potentially transformative.' },
  { id: 'ending', name: 'New Ending', costPct: 0.15, months: 1, qualityRange: [3, 10], audienceMod: 8, desc: 'Test audiences hated the ending. Give them what they want.' },
];

const BANKRUPTCY_THRESHOLD = -5000000;

// ==================== MULTI-CASTING SYSTEM ====================
const CAST_ROLES = [
  { id: 'lead', name: 'Lead', qualityWeight: 0.25, starPowerWeight: 0.50, salaryMult: 1.0 },
  { id: 'supporting1', name: 'Supporting', qualityWeight: 0.12, starPowerWeight: 0.25, salaryMult: 0.5 },
  { id: 'supporting2', name: 'Supporting 2', qualityWeight: 0.08, starPowerWeight: 0.15, salaryMult: 0.35 },
  { id: 'ensemble', name: 'Ensemble', qualityWeight: 0.05, starPowerWeight: 0.10, salaryMult: 0.25 },
];

// Director genre expertise — mismatch penalty, expertise bonus
const DIRECTOR_GENRE_MISMATCH_PENALTY = -8; // directing outside their genre
const DIRECTOR_GENRE_EXPERTISE_BONUS = 6;   // directing IN their genre
const DIRECTOR_PROVEN_BONUS = 4;            // had a hit in this genre before

// ==================== PRODUCTION PHASES ====================
const PRODUCTION_PHASES = [
  { id: 'script_dev', name: 'Script Development', baseTurns: 1, desc: 'Writing and refining the screenplay' },
  { id: 'pre_production', name: 'Pre-Production', baseTurns: 1, desc: 'Location scouting, crew hiring, storyboarding' },
  { id: 'principal_photography', name: 'Principal Photography', baseTurns: 2, desc: 'Cameras rolling — shooting the film' },
  { id: 'post_production', name: 'Post-Production', baseTurns: 2, desc: 'Editing, VFX, scoring, color grading' },
  { id: 'marketing_campaign', name: 'Marketing Campaign', baseTurns: 1, desc: 'Trailers, press, building audience buzz' },
];

const FILMING_EVENTS = [
  { id: 'creative_breakthrough', name: 'Creative Breakthrough', chance: 0.10, qualityMod: [4, 8], costMod: 0, desc: 'Director has a brilliant creative vision that elevates the film.' },
  { id: 'actor_conflict', name: 'Actor Conflict', chance: 0.08, qualityMod: [-6, -2], costMod: 0.05, desc: 'Tensions on set between talent. Morale drops.' },
  { id: 'weather_delay', name: 'Weather Delays', chance: 0.12, qualityMod: [0, 0], costMod: 0.08, desc: 'Bad weather halts outdoor shooting. Budget overruns.' },
  { id: 'improv_magic', name: 'Improvisation Magic', chance: 0.07, qualityMod: [3, 7], costMod: 0, desc: 'An actor improvises a scene that becomes iconic.' },
  { id: 'stunt_mishap', name: 'Stunt Mishap', chance: 0.06, qualityMod: [-2, 0], costMod: 0.10, desc: 'A stunt goes wrong. Insurance covers some costs.' },
  { id: 'location_gold', name: 'Location Discovery', chance: 0.08, qualityMod: [2, 5], costMod: -0.03, desc: 'Scout finds a perfect location that adds authenticity.' },
  { id: 'over_budget', name: 'Budget Overrun', chance: 0.15, qualityMod: [0, 0], costMod: 0.12, desc: 'Production costs balloon beyond estimates.' },
  { id: 'under_budget', name: 'Under Budget', chance: 0.06, qualityMod: [0, 0], costMod: -0.08, desc: 'Efficient production saves money.' },
  { id: 'director_vision', name: 'Director\'s Vision', chance: 0.08, qualityMod: [3, 6], costMod: 0.05, desc: 'Director demands expensive but brilliant additions.' },
  { id: 'chemistry_onset', name: 'On-Set Chemistry', chance: 0.09, qualityMod: [2, 5], costMod: 0, desc: 'Cast develops electric chemistry on screen.' },
];

const POST_PROD_DECISIONS = [
  { id: 'standard_edit', name: 'Standard Edit', costMult: 1.0, qualityMod: 0, desc: 'Professional editing on schedule and budget.' },
  { id: 'extended_edit', name: 'Extended Edit', costMult: 1.3, qualityMod: 4, desc: 'Extra months of editing polish. Costs more but higher quality.' },
  { id: 'vfx_heavy', name: 'VFX-Heavy Polish', costMult: 1.5, qualityMod: 6, genreBonus: ['Sci-Fi', 'Action', 'Fantasy', 'Animation'], desc: 'Pour resources into visual effects.' },
  { id: 'test_screen', name: 'Test Screening + Re-edit', costMult: 1.2, qualityMod: 3, audienceMod: 5, desc: 'Screen for test audience and re-edit based on feedback.' },
  { id: 'rush_job', name: 'Rush to Release', costMult: 0.7, qualityMod: -5, desc: 'Cut corners to release sooner. Saves money, hurts quality.' },
];

// ==================== BOX OFFICE BUDGET TIERS ====================
const BUDGET_TIERS = [
  { id: 'micro', name: 'Micro-Budget', maxBudget: 5e6, maxM: 5, grossCeiling: 400e6, avgMultiplier: 3.0, hitMultiplier: 40, color: 'text-gray-400', desc: 'Indie territory. Sleeper hit potential.' },
  { id: 'low', name: 'Low Budget', maxBudget: 25e6, maxM: 25, grossCeiling: 500e6, avgMultiplier: 2.5, hitMultiplier: 15, color: 'text-green-400', desc: 'Modest expectations. Good ROI potential.' },
  { id: 'mid', name: 'Mid-Budget', maxBudget: 75e6, maxM: 75, grossCeiling: 800e6, avgMultiplier: 2.0, hitMultiplier: 8, color: 'text-blue-400', desc: 'The endangered middle. Risky but rewarding.' },
  { id: 'big', name: 'Big Budget', maxBudget: 150e6, maxM: 150, grossCeiling: 1.5e9, avgMultiplier: 1.8, hitMultiplier: 6, color: 'text-purple-400', desc: 'Major studio tentpole territory.' },
  { id: 'blockbuster', name: 'Blockbuster', maxBudget: 250e6, maxM: 250, grossCeiling: 2.2e9, avgMultiplier: 1.5, hitMultiplier: 5, color: 'text-amber-400', desc: 'Franchise-scale production.' },
  { id: 'mega', name: 'Mega-Blockbuster', maxBudget: Infinity, maxM: Infinity, grossCeiling: 3e9, avgMultiplier: 1.2, hitMultiplier: 4, color: 'text-red-400', desc: 'The biggest bet in Hollywood.' },
];

const getBudgetTier = (budget) => {
  // Accept both budget in dollars and budget in millions
  const budgetVal = budget < 1000 ? budget * 1e6 : budget;
  for (const tier of BUDGET_TIERS) {
    if (budgetVal <= tier.maxBudget) return tier;
  }
  return BUDGET_TIERS[BUDGET_TIERS.length - 1];
};

// ==================== RELEASE COMPETITION ====================
const SEASONAL_COMPETITION = {
  1: { name: 'January Dump', baseCompetitors: 2, audienceMult: 0.6, desc: 'Low competition, low audiences' },
  2: { name: 'February Lull', baseCompetitors: 2, audienceMult: 0.65, desc: 'Quiet month, Valentine\'s weekend bump' },
  3: { name: 'Spring Warmup', baseCompetitors: 3, audienceMult: 0.75, desc: 'Audiences start returning' },
  4: { name: 'Easter Season', baseCompetitors: 3, audienceMult: 0.8, desc: 'Family films perform well' },
  5: { name: 'Summer Kickoff', baseCompetitors: 5, audienceMult: 1.15, holiday: 'Memorial Day', desc: 'Blockbuster season begins' },
  6: { name: 'Summer Peak', baseCompetitors: 6, audienceMult: 1.25, desc: 'Peak moviegoing season' },
  7: { name: 'July 4th Season', baseCompetitors: 6, audienceMult: 1.3, holiday: 'July 4th', desc: 'Action blockbusters dominate' },
  8: { name: 'Late Summer', baseCompetitors: 4, audienceMult: 1.05, desc: 'Summer winds down' },
  9: { name: 'Fall Transition', baseCompetitors: 3, audienceMult: 0.8, desc: 'Back to school season' },
  10: { name: 'Awards Season Opens', baseCompetitors: 4, audienceMult: 0.9, desc: 'Prestige films begin arriving' },
  11: { name: 'Thanksgiving Season', baseCompetitors: 5, audienceMult: 1.1, holiday: 'Thanksgiving', desc: 'Family tentpoles and prestige picks' },
  12: { name: 'Holiday Season', baseCompetitors: 5, audienceMult: 1.2, holiday: 'Christmas', desc: 'Big releases and awards contenders' },
};

const RIVAL_FILM_NAMES = [
  'Steel Horizon', 'The Last Kingdom', 'Midnight Express II', 'Neon Dreams', 'The Iron Fist',
  'Whispers in the Dark', 'Star Frontier', 'Ocean\'s Legacy', 'The Blind Side II', 'Code Red',
  'Emerald City', 'Shadow Protocol', 'Wings of Fire', 'The Perfect Storm', 'Frozen Hearts',
  'Thunder Road', 'Quantum Rift', 'The Silent Patient', 'Rogue Wave', 'Silver Lining',
  'Diamond Heist', 'The Lost City', 'Night Hunters', 'Empire Falls', 'Zero Hour',
  'Wild Card', 'The Deep Blue', 'Crimson Tide II', 'Galaxy Quest II', 'Phoenix Rising',
];

const generateCompetingFilms = (month, year, playerGenre, rivals) => {
  const season = SEASONAL_COMPETITION[month];
  if (!season) return [];
  const numCompetitors = season.baseCompetitors + randInt(0, 2);
  const competingFilms = [];
  const usedNames = new Set();
  for (let i = 0; i < numCompetitors; i++) {
    let name;
    do { name = pick(RIVAL_FILM_NAMES); } while (usedNames.has(name));
    usedNames.add(name);
    const genre = pick(GENRES);
    const budgetTier = pick(['low', 'mid', 'big', 'blockbuster']);
    const budgetRange = { low: [10e6, 25e6], mid: [30e6, 75e6], big: [80e6, 150e6], blockbuster: [160e6, 250e6] };
    const [lo, hi] = budgetRange[budgetTier] || [20e6, 50e6];
    const budget = lo + Math.random() * (hi - lo);
    const studio = rivals && rivals.length > 0 ? pick(rivals).name : 'Rival Studio';
    const buzz = randInt(20, 95);
    competingFilms.push({ name, genre, budgetTier, budget: Math.round(budget), studio, buzz, isGenreClash: genre === playerGenre });
  }
  return competingFilms;
};

// Competition impact on box office
const calcCompetitionDrain = (competingFilms, playerGenre, playerBudget) => {
  if (!competingFilms || competingFilms.length === 0) return 1.0;
  let drain = 0;
  competingFilms.forEach(cf => {
    const budgetShare = Math.min(cf.budget / (playerBudget || 50e6), 2.0);
    const buzzFactor = cf.buzz / 100;
    let impact = budgetShare * buzzFactor * 0.04; // each film drains ~4% base
    if (cf.genre === playerGenre) impact *= 2.5; // same-genre competition is brutal
    drain += impact;
  });
  return Math.max(0.5, 1.0 - drain); // cap at 50% drain
};

// ==================== FLOP CONSEQUENCES ====================
const calcFlopSeverity = (film) => {
  const loss = Math.abs(film.profit);
  const budgetRatio = loss / Math.max(film.budget, 1);
  if (loss >= 200e6) return { level: 'catastrophic', repDmg: 15, presDmg: 10, stockDrop: 0.25, talentDmg: 20 };
  if (loss >= 100e6) return { level: 'devastating', repDmg: 10, presDmg: 7, stockDrop: 0.15, talentDmg: 12 };
  if (loss >= 50e6 || budgetRatio > 0.8) return { level: 'major', repDmg: 6, presDmg: 4, stockDrop: 0.08, talentDmg: 8 };
  if (loss >= 20e6) return { level: 'moderate', repDmg: 3, presDmg: 2, stockDrop: 0.04, talentDmg: 4 };
  return { level: 'minor', repDmg: 1, presDmg: 1, stockDrop: 0.02, talentDmg: 2 };
};

// ==================== SLEEPER HIT SYSTEM ====================
const SLEEPER_HIT_THRESHOLD = { maxBudget: 25e6, minAudienceScore: 80 };
const calcSleeperMultiplier = (film) => {
  if (!film || film.budget > SLEEPER_HIT_THRESHOLD.maxBudget) return 1.0;
  if ((film.audienceScore || 0) < SLEEPER_HIT_THRESHOLD.minAudienceScore) return 1.0;
  // Higher audience score = bigger sleeper multiplier
  const audienceExcess = (film.audienceScore - 80) / 20; // 0-1 range for scores 80-100
  const qualityFactor = Math.max(0, (film.quality || 50) - 60) / 40; // bonus for quality above 60
  const budgetFactor = 1.5 - (film.budget / SLEEPER_HIT_THRESHOLD.maxBudget); // smaller budget = bigger multiplier
  return 1.0 + (audienceExcess * 0.8 + qualityFactor * 0.6) * budgetFactor; // up to ~2.9x for perfect conditions
};

// ==================== IP MARKETPLACE ====================
const IP_CATEGORIES = {
  novel: { name: 'Novel Adaptation', icon: '📖', baseCost: [2e6, 15e6], qualityFloor: 10, audienceFloor: 0.15, criticMod: 3, desc: 'Literary prestige, built-in readership' },
  comic: { name: 'Comic Book IP', icon: '💥', baseCost: [5e6, 40e6], qualityFloor: 5, audienceFloor: 0.25, criticMod: -3, desc: 'Massive audience, franchise potential' },
  game: { name: 'Video Game IP', icon: '🎮', baseCost: [3e6, 25e6], qualityFloor: 0, audienceFloor: 0.20, criticMod: -5, desc: 'Built-in fans, risky adaptation' },
  true_story: { name: 'True Story', icon: '📰', baseCost: [1e6, 8e6], qualityFloor: 12, audienceFloor: 0.10, criticMod: 6, desc: 'Awards bait, authentic appeal' },
  stage: { name: 'Stage Play', icon: '🎭', baseCost: [2e6, 12e6], qualityFloor: 15, audienceFloor: 0.08, criticMod: 8, desc: 'Critical prestige, niche audience' },
  toy: { name: 'Toy/Brand IP', icon: '🧸', baseCost: [8e6, 50e6], qualityFloor: 0, audienceFloor: 0.30, criticMod: -8, desc: 'Kids love it, critics hate it' },
  remake: { name: 'Remake/Reboot', icon: '🔄', baseCost: [3e6, 20e6], qualityFloor: 5, audienceFloor: 0.18, criticMod: -2, desc: 'Name recognition, comparison risk' },
};

const IP_AUDIENCE_MULT = { small: 0.7, medium: 1.0, large: 1.3, massive: 1.6 };

const IP_POOL = gameContent.ipPool || [];

const generateIPMarketplace = (year, ownedIPs, numSlots = 6) => {
  const available = IP_POOL.filter(ip => !(ownedIPs || []).some(o => o.name === ip.name));
  if (available.length === 0) return [];
  const selected = [];
  const used = new Set();
  for (let i = 0; i < Math.min(numSlots, available.length); i++) {
    let ip;
    let attempts = 0;
    do { ip = pick(available); attempts++; } while (used.has(ip.name) && attempts < 50);
    if (used.has(ip.name)) continue;
    used.add(ip.name);
    const cat = IP_CATEGORIES[ip.category] || IP_CATEGORIES.novel;
    const [costMin, costMax] = cat.baseCost;
    const recogMult = 0.5 + (ip.recognition / 100) * 1.5;
    const audMult = IP_AUDIENCE_MULT[ip.audience] || 1.0;
    const eraInflation = Math.max(1.0, 1.0 + (year - 1970) * 0.015);
    const price = Math.round((costMin + Math.random() * (costMax - costMin)) * recogMult * audMult * eraInflation);
    const hotIP = ip.recognition >= 75 && Math.random() < 0.3;
    selected.push({
      ...ip,
      price,
      hotIP,
      rivalBidder: hotIP ? pick(['Paramount', 'Universal', 'Warner Bros.', 'MGM', 'Disney']) : null,
      marketFit: Math.round(40 + ip.recognition * 0.4 + (Math.random() - 0.5) * 20),
    });
  }
  return selected;
};

const calcScreenplayQuality = (writer, genre, budget, turns) => {
  let base = 25 + writer.skill * 0.45;
  if (writer.genreBonus === genre) base += 12;
  if (turns >= 3) base += 5;
  base += randInt(-8, 8);
  const budgetBonus = Math.min(budget / 2e6, 8);
  base += budgetBonus;
  return Math.round(clamp(base, 15, 95));
};

// ==================== STAR POWER CALC (multi-cast) ====================
const calcCastStarPower = (castMembers) => {
  if (!castMembers || castMembers.length === 0) return 0;
  let total = 0;
  castMembers.forEach((member, idx) => {
    const role = CAST_ROLES[idx] || CAST_ROLES[CAST_ROLES.length - 1];
    const pop = member.popularity || 0;
    total += pop * role.starPowerWeight;
  });
  return Math.round(Math.min(total, 100));
};

// ==================== CRITICS VS AUDIENCE SPLIT ====================
const calcSplitScores = (quality, film, budget, marketing) => {
  // Critics favor: quality, originality, auteur directors, thematic depth, low studio control
  let criticBase = quality * 0.85 + (Math.random() - 0.4) * 15;
  // Audience favors: entertainment, star power, genre appeal, spectacle, marketing
  let audienceBase = quality * 0.65 + (Math.random() - 0.3) * 18;

  // Director control affects critic appreciation
  if (film.studioControl !== undefined) {
    const dirControl = 100 - film.studioControl;
    if (dirControl >= 70) criticBase += 8;
    if (film.studioControl >= 70) audienceBase += 6;
  }

  // Originality bonus for critics
  if (film.filmType === 'original') criticBase += 5;
  if (film.filmType === 'sequel') { criticBase -= 4; audienceBase += 3; }
  if (film.filmType === 'reboot') { criticBase -= 2; audienceBase += 2; }

  // Budget affects audience expectation
  const budgetM = budget / 1e6;
  if (budgetM >= 150) audienceBase += 5; // spectacle bonus
  if (budgetM < 10) criticBase += 4; // indie cred

  // Star power affects audience score
  const castStarPower = film.castMembers ? calcCastStarPower(film.castMembers) : (film.actor?.popularity || 50);
  audienceBase += castStarPower * 0.1;

  // Marketing affects audience awareness
  const marketingRatio = marketing / Math.max(budget, 1);
  audienceBase += Math.min(marketingRatio * 8, 10);

  // Genre modifiers
  const criticGenres = ['Drama', 'Documentary', 'War', 'Mystery']; // critics love these
  const audienceGenres = ['Action', 'Comedy', 'Animation', 'Sci-Fi']; // audiences love these
  if (criticGenres.includes(film.genre)) criticBase += 5;
  if (audienceGenres.includes(film.genre)) audienceBase += 5;

  // Tone modifiers
  if (film.tone) {
    const toneData = TONES.find(t => t.id === film.tone);
    if (toneData) {
      criticBase += toneData.criticMod;
      audienceBase += toneData.audienceMod;
    }
  }

  // Theme modifiers
  if (film.themes && film.themes.length > 0) {
    film.themes.forEach(tid => {
      const theme = FILM_THEMES.find(t => t.id === tid);
      if (theme) {
        criticBase += theme.criticMod * 0.5;
        audienceBase += theme.audienceMod * 0.5;
        if (theme.genreBonus.includes(film.genre)) { criticBase += 2; audienceBase += 2; }
      }
    });
  }

  // IP modifiers
  if (film.isIP) {
    const ipCat = IP_CATEGORIES[film.ipCategory] || {};
    criticBase += ipCat.criticMod || 0;
    // High-recognition IPs get audience awareness boost
    audienceBase += (film.ipRecognition || 0) * 0.1;
  }
  if (film.isOriginal) {
    criticBase += 5; // critics love originals even more
  }

  return {
    criticScore: Math.round(clamp(criticBase, 5, 99)),
    audienceScore: Math.round(clamp(audienceBase, 5, 99)),
  };
};

const getCareerPhase = (age) => CAREER_PHASES.find(p => age >= p.minAge && age <= p.maxAge) || CAREER_PHASES[4];

const SCRIPTS = gameContent.scripts;

const FIRST_NAMES = gameContent.firstNames;
const LAST_NAMES = gameContent.lastNames;
const ADAPTATIONS = gameContent.adaptations;

const ACHIEVEMENTS = [
  { id: 'first_film', name: 'Lights, Camera, Action!', desc: 'Release your first film', check: (s) => s.totalFilmsReleased >= 1 },
  { id: 'profitable', name: 'In the Black', desc: 'Release a film that earns profit', check: (s) => s.films.some(f => f.status === 'released' && f.profit > 0) },
  { id: 'blockbuster', name: 'Blockbuster', desc: 'Gross over $200M with a single film', check: (s) => s.films.some(f => f.totalGross >= 200000000) },
  { id: 'billion_film', name: 'The Billion Dollar Movie', desc: 'Gross over $1B with a single film', check: (s) => s.films.some(f => f.totalGross >= 1000000000) },
  { id: 'low_budget_hit', name: 'Lightning in a Bottle', desc: 'Make $50M+ profit on a film under $5M budget', check: (s) => s.films.some(f => f.budget <= 5000000 && f.profit >= 50000000) },
  { id: 'critics_darling', name: "Critics' Darling", desc: 'Get a critic score of 95+', check: (s) => s.films.some(f => f.criticScore >= 95) },
  { id: 'crowd_pleaser', name: 'Crowd Pleaser', desc: 'Get an audience score of 95+', check: (s) => s.films.some(f => f.audienceScore >= 95) },
  { id: 'five_films', name: 'Getting Started', desc: 'Release 5 films', check: (s) => s.films.filter(f => f.status === 'released').length >= 5 },
  { id: 'twenty_films', name: 'Prolific Producer', desc: 'Release 20 films', check: (s) => s.films.filter(f => f.status === 'released').length >= 20 },
  { id: 'fifty_films', name: 'Film Factory', desc: 'Release 50 films', check: (s) => s.films.filter(f => f.status === 'released').length >= 50 },
  { id: 'genre_master', name: 'Genre Master', desc: 'Release a profitable film in every genre', check: (s) => { const profitableGenres = new Set(s.films.filter(f => f.profit > 0).map(f => f.genre)); return GENRES.every(g => profitableGenres.has(g)); } },
  { id: 'sequel_success', name: 'Sequel That Delivers', desc: 'Release a sequel that outgrosses the original', check: (s) => s.films.some(f => f.filmType === 'sequel' && f.totalGross > 0) },
  { id: 'adaptation_king', name: 'Adaptation King', desc: 'Successfully adapt 5 properties', check: (s) => s.films.filter(f => f.filmType === 'adaptation' && f.profit > 0).length >= 5 },
  { id: 'horror_halloween', name: 'Perfect Timing', desc: 'Release a horror film at Halloween with 80+ quality', check: (s) => s.films.some(f => f.genre === 'Horror' && f.releaseWindow === 'halloween' && f.quality >= 80) },
  { id: 'award_sweep', name: 'Award Sweep', desc: 'Win 3+ awards in a single year', check: (s) => { const years = {}; s.awards.forEach(a => { years[a.year] = (years[a.year] || 0) + 1; }); return Object.values(years).some(v => v >= 3); } },
  { id: 'cash_hoard', name: 'Money Vault', desc: 'Have $1B in cash', check: (s) => s.cash >= 1000000000 },
  { id: 'decade_run', name: 'A Decade of Cinema', desc: 'Play for 10 years (40 turns)', check: (s) => s.turn >= 40 },
  { id: 'streaming_launch', name: 'Digital Frontier', desc: 'Launch a streaming platform', check: (s) => s.streamingPlatform !== null },
  { id: 'triple_threat', name: 'Triple Threat', desc: 'Have 3 films in production simultaneously', check: (s) => s.films.filter(f => ['development', 'production', 'postproduction'].includes(f.status)).length >= 3 },
];

const PRESTIGE_TIERS = [
  { name: 'Indie Outfit', minScore: 0, color: 'text-gray-400' },
  { name: 'Mid-Tier Studio', minScore: 500, color: 'text-blue-400' },
  { name: 'Major Studio', minScore: 2000, color: 'text-purple-400' },
  { name: 'Legendary Studio', minScore: 10000, color: 'text-amber-400' },
];

const RANDOM_EVENTS = [
  // Market events
  { text: 'Box Office Boom! All releases this month get +30% gross.', type: 'boom' },
  { text: 'Market Downturn — audiences staying home. Releases get -25% gross.', type: 'bust' },
  { text: 'Great press coverage for your studio. +3 reputation, +2 prestige.', type: 'publicity' },

  // Genre events
  { text: 'A cultural phenomenon boosts {genre} films this month!', type: 'genreBoost' },
  { text: '{genre} films are oversaturating the market. -15% gross for {genre} this month.', type: 'genreBust' },

  // Prestige/reputation
  { text: 'Award season buzz surrounds your studio. +5 prestige.', type: 'prestigeBoost' },
  { text: "A rival studio's biggest film flopped — market opportunity! +5 reputation.", type: 'reputationBoost' },

  // Production events
  { text: 'Creative breakthrough on a production! +10 quality.', type: 'qualityBoost' },
  { text: 'Budget overrun on a production! Costs +25%.', type: 'budgetOverrun' },
  { text: 'Rising talent costs across the industry. Next hire costs +20%.', type: 'talentInflation' },
  { text: 'International markets expanding rapidly. +20% international gross this month.', type: 'intlBoost' },

  // Film festivals
  { text: "Your film is selected for the Cannes Film Festival! +8 prestige.", type: 'festivalCannes' },
  { text: "Sundance Film Festival spotlights your indie work! +5 prestige, +3 reputation.", type: 'festivalSundance' },
  { text: "Your film wins the Venice Golden Lion! +10 prestige.", type: 'festivalVenice' },

  // Industry disruption
  { text: "A writers' strike threatens production! Films in development delayed 1 turn.", type: 'writersStrike' },
  { text: "An actors' union dispute causes production slowdowns.", type: 'actorsStrike' },
  { text: 'New filmmaking technology reduces production costs by 15% this month.', type: 'techBreakthrough' },

  // Cultural moments
  { text: 'A viral social media trend boosts audience interest in movies. +15% gross.', type: 'viralMoment' },
  { text: 'A competing entertainment format (video games/streaming series) draws audiences away. -10% gross.', type: 'competitionDrain' },
  { text: 'Nostalgia wave! Sequels and reboots get +25% gross this month.', type: 'nostalgiaWave' },
  { text: 'Audiences are craving originality. Original screenplays get +20% gross.', type: 'originalityWave' },

  // Financial
  { text: 'Economic recession hits. Ticket prices effectively drop, -20% domestic gross.', type: 'recession' },
  { text: 'Booming economy! Consumer spending up, +15% gross all films.', type: 'economicBoom' },
  { text: 'Foreign currency fluctuations hurt international returns. -15% international.', type: 'currencyDrop' },

  // Celebrity/talent
  { text: 'One of your stars goes viral on social media! +10 popularity for a random contract.', type: 'starViral' },
  { text: 'A talent scandal makes headlines. -5 reputation.', type: 'scandal' },
  { text: 'A legendary filmmaker wants to work with you! Free high-skill director available.', type: 'legendaryTalent' },
];

// ==================== TALENT DRAMA EVENTS ====================
const TALENT_DRAMAS = [
  { text: '{name} demands a raise or they walk!', type: 'demand_raise', weight: 3 },
  { text: '{name} and {name2} feud on set — morale drops for both.', type: 'feud', weight: 2 },
  { text: '{name} checks into rehab. Out for 6 months.', type: 'rehab', weight: 1 },
  { text: '{name} wins a prestigious independent award! +15 popularity, +5 morale.', type: 'indie_award', weight: 2 },
  { text: '{name} has a breakout social media moment! +10 popularity.', type: 'social_buzz', weight: 2 },
  { text: '{name} is burned out and considering retirement.', type: 'burnout', weight: 1 },
  { text: '{name} mentors a younger talent — both improve.', type: 'mentor', weight: 1 },
  { text: '{name} delivers an incredible performance in rehearsals! +5 skill for next film.', type: 'hot_streak', weight: 2 },
  { text: '{name} involved in a public controversy. -10 popularity, -3 reputation.', type: 'controversy', weight: 1 },
  { text: '{name} is poached by a rival studio!', type: 'poached', weight: 1 },
];

// ==================== LOAN & BUSINESS ====================
const getEraLoanRates = (year) => {
  // Interest rates by era: high in early decades, low in modern era
  let eraMod = 1.0;
  if (year < 1980) eraMod = 0.8;       // lower rates in golden age
  else if (year < 1990) eraMod = 1.5;   // high rates in 80s
  else if (year < 2000) eraMod = 1.2;   // moderate 90s
  else if (year < 2010) eraMod = 0.9;   // low 2000s
  else eraMod = 0.7;                     // very low modern era
  return eraMod;
};

const LOAN_OPTIONS = [
  { name: 'Small Loan', amount: 5000000, interestRate: 0.01, termMonths: 36 },
  { name: 'Medium Loan', amount: 20000000, interestRate: 0.013, termMonths: 60 },
  { name: 'Large Loan', amount: 50000000, interestRate: 0.017, termMonths: 84 },
  { name: 'Mega Loan', amount: 100000000, interestRate: 0.02, termMonths: 120 },
];

const DISTRIBUTION_DEALS = [
  { name: 'Indie Circuit', cost: 500000, domesticBonus: 0.05, duration: 8, minRep: 0 },
  { name: 'Regional Chain Deal', cost: 2000000, domesticBonus: 0.10, duration: 12, minRep: 30 },
  { name: 'National Distribution', cost: 10000000, domesticBonus: 0.15, duration: 16, minRep: 50 },
  { name: 'Global Distribution Network', cost: 30000000, domesticBonus: 0.10, intlBonus: 0.20, duration: 20, minRep: 70 },
];

// ==================== STUDIO CUSTOMIZATION ====================
const STUDIO_COLORS = [
  { name: 'Gold', accent: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-400', ring: 'ring-amber-400' },
  { name: 'Crimson', accent: 'text-red-400', bg: 'bg-red-500', border: 'border-red-400', ring: 'ring-red-400' },
  { name: 'Royal Blue', accent: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-400', ring: 'ring-blue-400' },
  { name: 'Emerald', accent: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-400', ring: 'ring-emerald-400' },
  { name: 'Violet', accent: 'text-violet-400', bg: 'bg-violet-500', border: 'border-violet-400', ring: 'ring-violet-400' },
  { name: 'Silver', accent: 'text-gray-300', bg: 'bg-gray-400', border: 'border-gray-300', ring: 'ring-gray-300' },
];

const SPECIALIZATIONS = [
  { name: 'None', desc: 'No specialty — balanced studio.', bonus: {} },
  { name: 'Prestige Cinema', desc: '+8 quality on Drama/Thriller, +3 prestige/film.', bonus: { qualityGenres: ['Drama', 'Thriller'], qualityBonus: 8, prestigeBonus: 3 } },
  { name: 'Blockbuster Factory', desc: '+15% gross on Action/Sci-Fi, +5% marketing effect.', bonus: { grossGenres: ['Action', 'Sci-Fi'], grossBonus: 0.15, marketingBonus: 0.05 } },
  { name: 'Horror House', desc: '+10 quality on Horror, 20% lower budgets for Horror.', bonus: { qualityGenres: ['Horror'], qualityBonus: 10, budgetDiscount: 0.20, discountGenres: ['Horror'] } },
  { name: 'Animation Empire', desc: '+10 quality on Animation, +25% international gross.', bonus: { qualityGenres: ['Animation'], qualityBonus: 10, intlBonus: 0.25, intlGenres: ['Animation'] } },
  { name: 'Indie Darling', desc: '+12 quality on low budgets (<$20M), +5 prestige/film.', bonus: { lowBudgetBonus: 12, lowBudgetThreshold: 20e6, prestigeBonus: 5 } },
  { name: 'Documentary Collective', desc: '+15 quality on Documentary, +8 prestige/film.', bonus: { qualityGenres: ['Documentary'], qualityBonus: 15, prestigeBonus: 8 } },
];

// ==================== LEGACY & ENDGAME ====================
const LEGACY_BENCHMARKS = [
  { name: 'Fly-By-Night Studio', minScore: 0, desc: 'Barely a footnote in cinema history.' },
  { name: 'Cult Favorite', minScore: 500, desc: 'A small but dedicated following remembers your films.' },
  { name: 'Respected Independent', minScore: 2000, desc: 'Critics and cinephiles know your name well.' },
  { name: 'Major Studio', minScore: 5000, desc: 'You stand among the industry giants.' },
  { name: 'Hollywood Dynasty', minScore: 12000, desc: 'Your studio shaped the art of cinema itself.' },
  { name: 'Eternal Legend', minScore: 25000, desc: 'Generations will study your contributions to film.' },
];

const calcLegacyScore = (state) => {
  let score = 0;
  score += Math.round(state.totalGross / 1e7);       // $10M = 1 point
  score += state.totalAwards * 50;                     // each award = 50
  score += state.prestige * 5;                         // prestige * 5
  score += state.reputation * 3;                       // reputation * 3
  score += state.totalFilmsReleased * 10;              // each film = 10
  score += state.franchises.length * 100;              // each franchise = 100
  score += (state.streamingPlatform ? Math.round(state.streamingPlatform.subscribers / 100000) : 0); // streaming subs
  score += state.unlockedAchievements.length * 30;     // each achievement = 30
  const profitableFilms = state.films.filter(f => f.profit > 0).length;
  score += profitableFilms * 15;                       // profitable films bonus
  // Milestone bonuses
  Object.values(state.milestones).filter(Boolean).forEach(() => { score += 200; });
  // New feature bonuses
  score += (state.unlockedTech?.length || 0) * 20;     // tech tree
  score += (state.tvShows?.filter(s => s.status === 'airing')?.length || 0) * 50; // TV shows
  score += (state.themeParks?.filter(p => p.operational)?.length || 0) * 200; // theme parks
  score += (state.theaterChains?.length || 0) * 150;   // theater chains
  score += (state.acquiredStudios?.length || 0) * 300;  // acquired studios
  score += (state.isPublic ? 500 : 0);                 // IPO bonus
  score += (state.festivalSubmissions?.filter(s => s.result === 'won')?.length || 0) * 80; // festival wins
  return score;
};

// ==================== AWARD CEREMONIES ====================
const AWARD_SHOWS = [
  {
    id: 'oscars', name: 'Academy Awards (Oscars)', shortName: 'Oscars', icon: '🏆',
    month: 3, // March ceremony
    prestigeBonus: 5, reputationBonus: 3, grossBonus: 0.08,
    desc: 'The most prestigious film awards in the world.',
    categories: [
      { name: 'Best Picture', weight: 'quality', icon: '🏆', prestigeBonus: 8 },
      { name: 'Best Director', weight: 'directorSkill', icon: '🎬', prestigeBonus: 5 },
      { name: 'Best Actor', weight: 'actorSkill', icon: '⭐', prestigeBonus: 4 },
      { name: 'Best Actress', weight: 'actressSkill', icon: '⭐', prestigeBonus: 4 },
      { name: 'Best Original Screenplay', weight: 'writerSkill', icon: '📜', prestigeBonus: 3 },
      { name: 'Best Adapted Screenplay', weight: 'adaptedWriterSkill', icon: '📜', prestigeBonus: 3 },
      { name: 'Best Cinematography', weight: 'visual', icon: '📷', prestigeBonus: 2 },
      { name: 'Best Original Score', weight: 'artistry', icon: '🎵', prestigeBonus: 2 },
      { name: 'Best Visual Effects', weight: 'vfx', icon: '✨', prestigeBonus: 2 },
      { name: 'Best Animated Feature', weight: 'animated', icon: '🎨', prestigeBonus: 3 },
      { name: 'Best International Film', weight: 'international', icon: '🌍', prestigeBonus: 3 },
      { name: 'Best Film Editing', weight: 'editing', icon: '✂️', prestigeBonus: 1 },
    ],
  },
  {
    id: 'golden_globes', name: 'Golden Globe Awards', shortName: 'Golden Globes', icon: '🌐',
    month: 1, // January ceremony (precursor to Oscars)
    prestigeBonus: 3, reputationBonus: 2, grossBonus: 0.05,
    desc: 'Awarded by the Hollywood Foreign Press. Often a precursor to the Oscars.',
    categories: [
      { name: 'Best Motion Picture - Drama', weight: 'qualityDrama', icon: '🎭', prestigeBonus: 4 },
      { name: 'Best Motion Picture - Musical/Comedy', weight: 'qualityComedy', icon: '😂', prestigeBonus: 4 },
      { name: 'Best Director', weight: 'directorSkill', icon: '🎬', prestigeBonus: 3 },
      { name: 'Best Actor - Drama', weight: 'actorSkill', icon: '⭐', prestigeBonus: 2 },
      { name: 'Best Actress - Drama', weight: 'actressSkill', icon: '⭐', prestigeBonus: 2 },
      { name: 'Best Actor - Musical/Comedy', weight: 'actorComedy', icon: '😄', prestigeBonus: 2 },
      { name: 'Best Screenplay', weight: 'writerSkill', icon: '📜', prestigeBonus: 2 },
      { name: 'Best Original Score', weight: 'artistry', icon: '🎵', prestigeBonus: 1 },
      { name: 'Best Animated Film', weight: 'animated', icon: '🎨', prestigeBonus: 2 },
    ],
  },
  {
    id: 'bafta', name: 'BAFTA Awards', shortName: 'BAFTAs', icon: '🇬🇧',
    month: 2, // February ceremony
    prestigeBonus: 4, reputationBonus: 2, grossBonus: 0.04,
    desc: 'The British Academy Film Awards — prestige from across the pond.',
    categories: [
      { name: 'Best Film', weight: 'quality', icon: '🏆', prestigeBonus: 5 },
      { name: 'Best Director', weight: 'directorSkill', icon: '🎬', prestigeBonus: 3 },
      { name: 'Best Leading Actor', weight: 'actorSkill', icon: '⭐', prestigeBonus: 2 },
      { name: 'Best Leading Actress', weight: 'actressSkill', icon: '⭐', prestigeBonus: 2 },
      { name: 'Best Original Screenplay', weight: 'writerSkill', icon: '📜', prestigeBonus: 2 },
      { name: 'Best Cinematography', weight: 'visual', icon: '📷', prestigeBonus: 2 },
      { name: 'Best Film Not in English', weight: 'international', icon: '🌍', prestigeBonus: 2 },
      { name: 'Best Animated Film', weight: 'animated', icon: '🎨', prestigeBonus: 2 },
      { name: 'Best Visual Effects', weight: 'vfx', icon: '✨', prestigeBonus: 1 },
    ],
  },
  {
    id: 'sag', name: 'SAG Awards', shortName: 'SAG Awards', icon: '🎭',
    month: 2, // February
    prestigeBonus: 2, reputationBonus: 2, grossBonus: 0.03,
    desc: 'Screen Actors Guild — voted on by actors, the strongest predictor of Oscar acting wins.',
    categories: [
      { name: 'Outstanding Cast in a Film', weight: 'ensemble', icon: '👥', prestigeBonus: 3 },
      { name: 'Outstanding Actor', weight: 'actorSkill', icon: '⭐', prestigeBonus: 2 },
      { name: 'Outstanding Actress', weight: 'actressSkill', icon: '⭐', prestigeBonus: 2 },
    ],
  },
  {
    id: 'dga', name: 'Directors Guild Awards', shortName: 'DGA Awards', icon: '🎥',
    month: 2,
    prestigeBonus: 2, reputationBonus: 1, grossBonus: 0.02,
    desc: 'Voted by directors — the strongest predictor of Best Director at the Oscars.',
    categories: [
      { name: 'Outstanding Director', weight: 'directorSkill', icon: '🎬', prestigeBonus: 3 },
      { name: 'Outstanding First-Time Director', weight: 'firstTimeDirector', icon: '🌟', prestigeBonus: 2 },
    ],
  },
  {
    id: 'critics_choice', name: 'Critics Choice Awards', shortName: 'Critics Choice', icon: '📝',
    month: 1,
    prestigeBonus: 2, reputationBonus: 2, grossBonus: 0.03,
    desc: 'Voted by critics — often aligns with Oscar results.',
    categories: [
      { name: 'Best Picture', weight: 'critics', icon: '🏆', prestigeBonus: 3 },
      { name: 'Best Director', weight: 'directorCritic', icon: '🎬', prestigeBonus: 2 },
      { name: 'Best Actor', weight: 'actorCritic', icon: '⭐', prestigeBonus: 1 },
      { name: 'Best Actress', weight: 'actressCritic', icon: '⭐', prestigeBonus: 1 },
      { name: 'Best Screenplay', weight: 'writerSkill', icon: '📜', prestigeBonus: 1 },
      { name: 'Best Visual Effects', weight: 'vfx', icon: '✨', prestigeBonus: 1 },
      { name: 'Best Comedy', weight: 'qualityComedy', icon: '😂', prestigeBonus: 1 },
      { name: 'Best Sci-Fi/Horror', weight: 'qualityGenre', icon: '👾', prestigeBonus: 1 },
    ],
  },
  {
    id: 'spirit', name: 'Independent Spirit Awards', shortName: 'Spirit Awards', icon: '🕊️',
    month: 2,
    prestigeBonus: 3, reputationBonus: 3, grossBonus: 0.02,
    desc: 'Celebrating the best in independent film — budget under $30M preferred.',
    categories: [
      { name: 'Best Feature', weight: 'qualityIndie', icon: '🏆', prestigeBonus: 4 },
      { name: 'Best Director', weight: 'directorIndie', icon: '🎬', prestigeBonus: 2 },
      { name: 'Best First Feature', weight: 'firstTimeDirector', icon: '🌟', prestigeBonus: 2 },
      { name: 'Best Screenplay', weight: 'writerSkill', icon: '📜', prestigeBonus: 2 },
    ],
  },
  {
    id: 'peoples_choice', name: "People's Choice Awards", shortName: "People's Choice", icon: '❤️',
    month: 12,
    prestigeBonus: 0, reputationBonus: 4, grossBonus: 0.06,
    desc: 'Voted by fans — pure audience popularity.',
    categories: [
      { name: 'Favorite Movie', weight: 'audience', icon: '❤️', prestigeBonus: 0 },
      { name: 'Favorite Action Movie', weight: 'audienceAction', icon: '💥', prestigeBonus: 0 },
      { name: 'Favorite Comedy Movie', weight: 'audienceComedy', icon: '😂', prestigeBonus: 0 },
      { name: 'Favorite Drama Movie', weight: 'audienceDrama', icon: '🎭', prestigeBonus: 0 },
      { name: 'Favorite Movie Actor', weight: 'actorPopularity', icon: '⭐', prestigeBonus: 0 },
    ],
  },
  {
    id: 'razzie', name: 'Golden Raspberry Awards (Razzies)', shortName: 'Razzies', icon: '🍿',
    month: 3, // Night before Oscars
    prestigeBonus: -3, reputationBonus: -2, grossBonus: 0,
    desc: 'Dishonoring the worst in film — pray your studio isn\'t nominated.',
    isNegative: true,
    categories: [
      { name: 'Worst Picture', weight: 'worstQuality', icon: '💩', prestigeBonus: -3 },
      { name: 'Worst Director', weight: 'worstDirector', icon: '🤦', prestigeBonus: -2 },
      { name: 'Worst Actor', weight: 'worstActor', icon: '😬', prestigeBonus: -1 },
      { name: 'Worst Screenplay', weight: 'worstScreenplay', icon: '🗑️', prestigeBonus: -2 },
    ],
  },
];

// Flatten for backward compat — primary ceremony categories (Oscars) used for generic scoring
const ANNUAL_AWARD_CATEGORIES = AWARD_SHOWS[0].categories;

const generateNominees = (allFilms, category, showId) => {
  if (allFilms.length === 0) return [];
  // Filter films based on category requirements
  let eligible = allFilms;
  // Genre-specific categories only consider matching films
  if (category.weight === 'animated') eligible = allFilms.filter(f => f.genre === 'Animation');
  if (category.weight === 'qualityDrama') eligible = allFilms.filter(f => ['Drama', 'War', 'Thriller', 'Mystery', 'Western'].includes(f.genre));
  if (category.weight === 'qualityComedy') eligible = allFilms.filter(f => ['Comedy', 'Musical', 'Romance', 'Animation'].includes(f.genre));
  if (category.weight === 'qualityGenre') eligible = allFilms.filter(f => ['Sci-Fi', 'Horror', 'Fantasy', 'Action'].includes(f.genre));
  if (category.weight === 'audienceAction') eligible = allFilms.filter(f => ['Action', 'Sci-Fi', 'Fantasy', 'War'].includes(f.genre));
  if (category.weight === 'audienceComedy') eligible = allFilms.filter(f => ['Comedy', 'Musical', 'Romance', 'Animation'].includes(f.genre));
  if (category.weight === 'audienceDrama') eligible = allFilms.filter(f => ['Drama', 'Thriller', 'Mystery', 'Western'].includes(f.genre));
  if (category.weight === 'international') eligible = allFilms.filter(f => (f.internationalPartner || f.isRival) && Math.random() < 0.5);
  if (category.weight === 'adaptedWriterSkill') eligible = allFilms.filter(f => f.filmType === 'adaptation' || f.filmType === 'sequel' || f.filmType === 'reboot');
  // Spirit Awards: prefer lower budgets
  if (category.weight === 'qualityIndie' || category.weight === 'directorIndie') eligible = allFilms.filter(f => (f.budget || 100e6) < 30e6);
  // First-time directors
  if (category.weight === 'firstTimeDirector') eligible = allFilms.filter(f => (f.director?.filmography || 5) <= 2);
  // If not enough eligible, fall back to all
  if (eligible.length < 3) eligible = allFilms;

  const scored = eligible.map(f => {
    let score = 0;
    switch (category.weight) {
      case 'quality': case 'qualityDrama': case 'qualityComedy': case 'qualityGenre':
      case 'qualityIndie': case 'animated':
        score = (f.quality || 0); break;
      case 'directorSkill': case 'directorCritic': case 'directorIndie':
        score = (f.director?.skill || 0) + (f.quality || 0) * 0.3; break;
      case 'firstTimeDirector':
        score = (f.quality || 0) + (f.director?.skill || 0) * 0.3; break;
      case 'actorSkill': case 'actorCritic': case 'actorComedy':
        score = (f.actor?.skill || 0) + (f.quality || 0) * 0.2 + (f.audienceScore || 0) * 0.1; break;
      case 'actressSkill': case 'actressCritic':
        // Simulate actress category — use actor skill with slight variation
        score = (f.actor?.skill || 0) * 0.9 + (f.quality || 0) * 0.3 + (Math.random() * 10); break;
      case 'actorPopularity':
        score = (f.actor?.popularity || 0) + (f.audienceScore || 0) * 0.3; break;
      case 'writerSkill': case 'adaptedWriterSkill':
        score = (f.writer?.skill || 0) + (f.criticScore || 0) * 0.2; break;
      case 'visual': case 'editing':
        score = (f.quality || 0) + (f.budget || 0) / 1e7; break;
      case 'artistry':
        score = (f.quality || 0) * 0.6 + (f.criticScore || 0) * 0.4; break;
      case 'vfx': {
        const vfxGenres = ['Sci-Fi', 'Fantasy', 'Animation', 'Action'];
        score = (f.quality || 0) + (vfxGenres.includes(f.genre) ? 20 : 0) + (f.budget || 0) / 1e7;
      } break;
      case 'ensemble':
        score = (f.quality || 0) * 0.4 + (f.actor?.skill || 0) * 0.3 + (f.director?.skill || 0) * 0.3; break;
      case 'international':
        score = (f.quality || 0) + (f.criticScore || 0) * 0.3; break;
      case 'gross': score = (f.totalGross || 0) / 1e6; break;
      case 'audience': case 'audienceAction': case 'audienceComedy': case 'audienceDrama':
        score = (f.audienceScore || 0); break;
      case 'critics': score = (f.criticScore || 0); break;
      // Razzie categories — LOWEST quality wins
      case 'worstQuality': score = -(f.quality || 50) + (f.budget || 0) / 5e7; break;
      case 'worstDirector': score = -(f.director?.skill || 50) - (f.quality || 50) * 0.3; break;
      case 'worstActor': score = -(f.actor?.skill || 50) - (f.audienceScore || 50) * 0.2; break;
      case 'worstScreenplay': score = -(f.writer?.skill || 50) - (f.criticScore || 50) * 0.3; break;
      default: score = (f.quality || 0);
    }
    // Add slight randomness
    score += (Math.random() - 0.5) * 8;
    // Awards campaign boost (not for Razzies!)
    if (f._awardsBoost && !category.weight.startsWith('worst')) score += f._awardsBoost;
    return { film: f, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((entry, i) => ({
    title: entry.film.title,
    studio: entry.film.studio || entry.film.isRival ? entry.film.studio : '(player)',
    quality: entry.film.quality,
    gross: entry.film.totalGross,
    criticScore: entry.film.criticScore,
    audienceScore: entry.film.audienceScore,
    director: entry.film.director?.name,
    actor: entry.film.actor?.name,
    writer: entry.film.writer?.name,
    genre: entry.film.genre,
    genre2: entry.film.genre2,
    filmType: entry.film.filmType,
    isRival: !!entry.film.isRival,
    isWinner: i === 0,
    score: Math.round(entry.score),
  }));
};

// ==================== RELEASE CALENDAR ====================

// Monthly release windows — each month has its own theatrical characteristics.
// A multiplier of 1.0 = normal. >1.0 = boost. <1.0 = penalty.
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const RELEASE_WINDOWS = {
  1: [{ id: 'jan', name: 'January', desc: 'Awards season expansions. Prestige dramas thrive, blockbusters struggle.', base: 0.70, genreBonus: { Drama: 0.45, Documentary: 0.35, Thriller: 0.15 }, genrePenalty: { Action: -0.25, Animation: -0.20, 'Sci-Fi': -0.15 }, prestigeBonus: 5 }],
  2: [{ id: 'feb', name: 'February', desc: "Valentine's month. Romance and comedies are date-night favorites.", base: 0.80, genreBonus: { Romance: 0.50, Comedy: 0.35, Drama: 0.15 }, genrePenalty: { Horror: -0.20, Documentary: -0.15 }, prestigeBonus: 0 }],
  3: [{ id: 'mar', name: 'March', desc: 'Spring Break. Families and teens flock to theaters.', base: 0.90, genreBonus: { Animation: 0.30, Comedy: 0.20, Action: 0.15 }, genrePenalty: { Documentary: -0.15 }, prestigeBonus: 0 }],
  4: [{ id: 'apr', name: 'April', desc: 'Pre-summer lull. Lower competition, moderate audiences.', base: 0.85, genreBonus: { Comedy: 0.15, Thriller: 0.15, Horror: 0.10 }, genrePenalty: { Documentary: -0.10 }, prestigeBonus: 0 }],
  5: [{ id: 'may', name: 'May', desc: 'Summer blockbuster season opens. Big tentpoles dominate.', base: 1.15, genreBonus: { Action: 0.40, 'Sci-Fi': 0.35, Animation: 0.25 }, genrePenalty: { Documentary: -0.25, Drama: -0.15 }, prestigeBonus: 0 }],
  6: [{ id: 'jun', name: 'June', desc: 'Peak summer. Massive audiences, fierce competition.', base: 1.25, genreBonus: { Action: 0.35, Comedy: 0.25, Animation: 0.30, 'Sci-Fi': 0.30 }, genrePenalty: { Drama: -0.20, Documentary: -0.30 }, prestigeBonus: 0 }],
  7: [{ id: 'jul', name: 'July', desc: 'Summer continues. Sequels and franchise films peak.', base: 1.20, genreBonus: { Action: 0.30, 'Sci-Fi': 0.25, Animation: 0.25, Comedy: 0.20 }, genrePenalty: { Drama: -0.15, Documentary: -0.20 }, prestigeBonus: 0 }],
  8: [{ id: 'aug', name: 'August', desc: 'Late summer. Action and comedy holdovers still draw crowds.', base: 1.0, genreBonus: { Action: 0.20, Comedy: 0.20, Horror: 0.15 }, genrePenalty: { Documentary: -0.10 }, prestigeBonus: 0 }],
  9: [{ id: 'sep', name: 'September', desc: 'Fall prestige season. Festival buzz helps quality dramas.', base: 0.85, genreBonus: { Drama: 0.35, Thriller: 0.20, Documentary: 0.25 }, genrePenalty: { Animation: -0.15, Action: -0.10 }, prestigeBonus: 4 }],
  10: [{ id: 'oct', name: 'October', desc: "Horror's biggest month. Audiences crave scares for Halloween.", base: 0.90, genreBonus: { Horror: 0.55, Thriller: 0.30, Mystery: 0.15 }, genrePenalty: { Animation: -0.20, Comedy: -0.10 }, prestigeBonus: 1 }],
  11: [{ id: 'nov', name: 'November', desc: 'Thanksgiving. Family films and tentpoles thrive.', base: 1.10, genreBonus: { Animation: 0.40, Action: 0.25, Comedy: 0.20 }, genrePenalty: { Horror: -0.15, Documentary: -0.10 }, prestigeBonus: 1 }],
  12: [{ id: 'dec', name: 'December', desc: 'Holiday season. Oscar contenders, family blockbusters, and awards-push releases.', base: 1.20, genreBonus: { Drama: 0.40, Animation: 0.35, Comedy: 0.25, Action: 0.20 }, genrePenalty: { Horror: -0.25 }, prestigeBonus: 6 }],
};

const getWindowMultiplier = (window, genre) => {
  const genreBonus = window.genreBonus[genre] || 0;
  const genrePenalty = window.genrePenalty?.[genre] || 0;
  return window.base + genreBonus + genrePenalty;
};

// ==================== HELPERS ====================

const pick = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const fmt = (amount) => {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(0) + 'K';
  return sign + '$' + abs;
};

const getEra = (year) => {
  if (year < 1980) return 'New Hollywood';
  if (year < 2000) return 'Blockbuster Era';
  if (year < 2015) return 'Digital Age';
  if (year < 2035) return 'Streaming Wars';
  if (year < 2060) return 'AI Renaissance';
  if (year < 2090) return 'Virtual Reality Age';
  if (year < 2130) return 'Neural Cinema';
  if (year < 2170) return 'Galactic Expansion';
  return 'Post-Human Era';
};

const getEraBudgetRange = (year) => {
  if (year < 1927) return [1, 1];       // Silent Era
  if (year < 1948) return [1, 5];       // Golden Age
  if (year < 1960) return [1, 10];      // Post-War
  if (year < 1980) return [1, 40];      // New Hollywood
  if (year < 1995) return [2, 100];     // Blockbuster Era
  if (year < 2005) return [3, 200];     // Digital Revolution
  if (year < 2015) return [5, 250];     // Franchise Dominance
  if (year < 2025) return [5, 300];     // Streaming Disruption
  if (year < 2045) return [5, 350];     // AI & Virtual Production
  if (year < 2080) return [10, 400];    // Immersive Cinema
  return [10, 400];                      // Neural Cinema
};

const getEraMarketingMax = (year) => {
  if (year < 1927) return 0.5;    // Silent Era
  if (year < 1948) return 3;      // Golden Age
  if (year < 1960) return 6;      // Post-War
  if (year < 1980) return 25;     // New Hollywood
  if (year < 1995) return 65;     // Blockbuster Era
  if (year < 2005) return 130;    // Digital Revolution
  if (year < 2015) return 165;    // Franchise Dominance
  if (year < 2025) return 200;    // Streaming Disruption
  if (year < 2045) return 230;    // AI & Virtual Production
  if (year < 2080) return 260;    // Immersive Cinema
  return 260;                      // Neural Cinema
};

// BUDGET_TIERS and getBudgetTier are defined in the box office section above

const getEraIntlMult = (year) => {
  if (year < 1980) return 0.3;
  if (year < 2000) return 0.5;
  if (year < 2015) return 0.9;
  if (year < 2035) return 1.3;
  if (year < 2060) return 1.6;
  if (year < 2090) return 2.0;
  if (year < 2130) return 2.5;
  if (year < 2170) return 3.0;
  return 4.0;
};

const makeGenreTrends = (year) => {
  const base = {};
  GENRES.forEach(g => { base[g] = 0; });
  if (year < 1980) {
    Object.assign(base, { Drama: 0.3, Thriller: 0.2, Horror: 0.15, Comedy: 0.1, Western: 0.2, War: 0.15, Musical: 0.1, Action: -0.1 });
  } else if (year < 2000) {
    Object.assign(base, { Action: 0.3, Comedy: 0.25, 'Sci-Fi': 0.2, Horror: 0.1, Romance: 0.15, Sports: 0.1, Drama: -0.1, Western: -0.2 });
  } else if (year < 2015) {
    Object.assign(base, { 'Sci-Fi': 0.3, Action: 0.25, Animation: 0.2, Fantasy: 0.25, Thriller: 0.1, Mystery: 0.1, Comedy: -0.1 });
  } else if (year < 2035) {
    Object.assign(base, { Thriller: 0.25, Horror: 0.2, Drama: 0.15, Documentary: 0.15, Mystery: 0.15, Fantasy: 0.1, Action: -0.1 });
  } else if (year < 2060) {
    Object.assign(base, { 'Sci-Fi': 0.35, Fantasy: 0.25, Animation: 0.2, Documentary: 0.2, Mystery: 0.15, Drama: 0.1, Western: -0.15 });
  } else if (year < 2090) {
    Object.assign(base, { 'Sci-Fi': 0.4, Fantasy: 0.3, Animation: 0.25, Action: 0.2, Horror: 0.15, Romance: 0.1 });
  } else if (year < 2130) {
    Object.assign(base, { 'Sci-Fi': 0.45, Fantasy: 0.35, Drama: 0.2, Mystery: 0.2, Animation: 0.2, Documentary: 0.15 });
  } else if (year < 2170) {
    Object.assign(base, { 'Sci-Fi': 0.5, Fantasy: 0.3, Action: 0.25, Animation: 0.25, Musical: 0.15, War: 0.1 });
  } else {
    Object.assign(base, { 'Sci-Fi': 0.5, Fantasy: 0.4, Drama: 0.2, Animation: 0.3, Documentary: 0.2, Mystery: 0.15 });
  }
  GENRES.forEach(g => { base[g] += (Math.random() - 0.5) * 0.1; });
  return base;
};

const makeName = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

const TRAITS = {
  actor: [
    { name: 'Method Actor', desc: '+8 quality on Drama/Thriller', effect: { qualityBonus: 8, genres: ['Drama', 'Thriller'] } },
    { name: 'Box Office Draw', desc: '+15% domestic gross', effect: { domesticBonus: 0.15 } },
    { name: 'International Star', desc: '+25% international gross', effect: { intlBonus: 0.25 } },
    { name: 'Comedy Genius', desc: '+10 quality on Comedy', effect: { qualityBonus: 10, genres: ['Comedy'] } },
    { name: 'Action Hero', desc: '+8 quality on Action/Sci-Fi', effect: { qualityBonus: 8, genres: ['Action', 'Sci-Fi'] } },
    { name: 'Scream Queen', desc: '+10 quality on Horror', effect: { qualityBonus: 10, genres: ['Horror'] } },
    { name: 'Award Magnet', desc: '+5 prestige per film', effect: { prestigeBonus: 5 } },
    { name: 'Newcomer', desc: 'Lower salary, high potential', effect: { salaryDiscount: 0.4 } },
    { name: 'Versatile', desc: 'No genre penalty', effect: { versatile: true } },
    { name: 'Fan Favorite', desc: '+20 popularity for franchise films', effect: { franchiseBonus: 20 } },
  ],
  director: [
    { name: 'Auteur', desc: '+10 quality, +5 prestige, higher salary', effect: { qualityFlat: 10, prestigeBonus: 5, salaryIncrease: 0.3 } },
    { name: 'Blockbuster King', desc: '+20% box office gross', effect: { grossBonus: 0.20 } },
    { name: 'Indie Visionary', desc: '+12 quality on low budgets (<$30M)', effect: { lowBudgetBonus: 12 } },
    { name: 'VFX Master', desc: '+10 quality on Sci-Fi/Animation', effect: { qualityBonus: 10, genres: ['Sci-Fi', 'Animation'] } },
    { name: 'Horror Maestro', desc: '+12 quality on Horror/Thriller', effect: { qualityBonus: 12, genres: ['Horror', 'Thriller'] } },
    { name: 'Fast & Efficient', desc: 'Production takes 1 fewer turn', effect: { speedBonus: 1 } },
    { name: 'Over Budget', desc: '+15% budget overrun risk but +5 quality', effect: { qualityFlat: 5, overBudget: 0.15 } },
    { name: 'Award Darling', desc: '+8 prestige, critics love them', effect: { prestigeBonus: 8 } },
    { name: 'Franchise Architect', desc: '+15% gross on sequels', effect: { sequelBonus: 0.15 } },
    { name: 'Crowd Pleaser', desc: '+10 audience score', effect: { audienceBonus: 10 } },
  ],
  writer: [
    { name: 'Sharp Dialogue', desc: '+8 quality on Drama/Comedy', effect: { qualityBonus: 8, genres: ['Drama', 'Comedy'] } },
    { name: 'World Builder', desc: '+10 quality on Sci-Fi/Animation', effect: { qualityBonus: 10, genres: ['Sci-Fi', 'Animation'] } },
    { name: 'Twist Master', desc: '+8 quality on Thriller/Horror', effect: { qualityBonus: 8, genres: ['Thriller', 'Horror'] } },
    { name: 'Franchise Writer', desc: 'Sequels keep quality (+no decay)', effect: { franchiseWriter: true } },
    { name: 'Oscar Bait', desc: '+10 critic score', effect: { criticBonus: 10 } },
    { name: 'Crowd Writer', desc: '+10 audience score', effect: { audienceBonus: 10 } },
    { name: 'Fast Draft', desc: 'Development takes 0 turns', effect: { devSpeed: 1 } },
    { name: 'Adaptable', desc: 'Works well across all genres', effect: { versatile: true } },
    { name: 'Blockbuster Pen', desc: '+15% domestic gross', effect: { domesticBonus: 0.15 } },
    { name: 'Deep Lore', desc: '+5 quality for franchise films', effect: { franchiseLore: 5 } },
  ],
  producer: [
    { name: 'Budget Hawk', desc: '-15% production costs', effect: { budgetDiscount: 0.15 } },
    { name: 'Talent Magnet', desc: '+10 morale for all crew', effect: { moraleBuff: 10 } },
    { name: 'Marketing Genius', desc: '+20% marketing effectiveness', effect: { marketingBonus: 0.20 } },
    { name: 'Studio Fixer', desc: 'Prevents budget overruns', effect: { noOverruns: true } },
    { name: 'Award Campaigner', desc: '+30% awards campaign effectiveness', effect: { awardsCampaignBonus: 0.30 } },
    { name: 'Franchise Producer', desc: '+10% gross on sequels and franchise films', effect: { franchiseProducer: 0.10 } },
    { name: 'International Connector', desc: '+15% international gross', effect: { intlBonus: 0.15 } },
    { name: 'Risk Taker', desc: 'Higher variance: quality ±15', effect: { qualityVariance: 15 } },
    { name: 'Legendary Producer', desc: '+5 quality, +3 prestige per film', effect: { qualityFlat: 5, prestigeBonus: 3 } },
    { name: 'Development Expert', desc: '-1 development month', effect: { devSpeed: 1 } },
  ],
  showrunner: [
    { name: 'Prestige Showrunner', desc: '+10 quality on Drama/Thriller', effect: { qualityBonus: 10, genres: ['Drama Series', 'Thriller Series'] } },
    { name: 'Comedy Architect', desc: '+12 quality on Comedy series', effect: { qualityBonus: 12, genres: ['Comedy Series'] } },
    { name: 'World Builder', desc: '+8 quality on Sci-Fi/Fantasy series', effect: { qualityBonus: 8, genres: ['Sci-Fi Series', 'Animation Series'] } },
    { name: 'Binge Master', desc: '+20% subscriber boost', effect: { subscriberBonus: 0.20 } },
    { name: 'Budget Miracle', desc: '-20% production costs', effect: { costDiscount: 0.20 } },
    { name: 'Critical Darling', desc: '+8 critic score for series', effect: { criticBonus: 8 } },
    { name: 'Audience Magnet', desc: '+15% viewership', effect: { viewershipBonus: 0.15 } },
    { name: 'Multi-Season Master', desc: 'Quality stays high across seasons', effect: { noSeasonDecay: true } },
    { name: 'Controversy Generator', desc: 'High buzz but risky', effect: { buzzBonus: 30, scandalChance: 0.15 } },
    { name: 'Franchise Builder', desc: 'Spinoffs get +15 quality', effect: { spinoffBonus: 15 } },
  ],
};

const makeTalent = (id, type, skillRange, ageRange) => {
  const skill = randInt(skillRange[0], skillRange[1]);
  const trait = pick(TRAITS[type]);
  let salary = skill * 15000 + randInt(0, 80000);
  if (trait.effect.salaryDiscount) salary = Math.round(salary * (1 - trait.effect.salaryDiscount));
  if (trait.effect.salaryIncrease) salary = Math.round(salary * (1 + trait.effect.salaryIncrease));
  const popularity = clamp(Math.round(skill * 0.7 + randInt(-10, 30)), 10, 99);
  const age = ageRange ? randInt(ageRange[0], ageRange[1]) : randInt(18, 72);
  return {
    id,
    name: makeName(),
    type,
    skill,
    popularity,
    salary,
    age,
    morale: randInt(60, 90),        // 0-100, affects quality contribution
    contractYears: randInt(2, 5),    // years left on contract
    filmography: 0,                  // films made with your studio
    genreBonus: pick(GENRES),
    trait: trait.name,
    traitDesc: trait.desc,
    traitEffect: trait.effect,
    // Profit participation demands (high-skill talent demands backend deals)
    profitParticipation: skill >= 75 ? Math.round((skill - 60) * 0.1 * 10) / 10 : 0, // 0-4% of gross
    demands: (() => {
      const d = [];
      TALENT_DEMANDS.forEach(td => {
        if (Math.random() < td.weight) {
          const demand = td.generate(skill, null);
          if (demand) d.push(demand);
        }
      });
      return d;
    })(),
  };
};

const makeScripts = (year) => {
  const [budMin, budMax] = getEraBudgetRange(year);
  return Array.from({ length: 4 }, (_, i) => {
    const genre = GENRES[randInt(0, GENRES.length - 1)];
    const tpl = pick(SCRIPTS[genre]);
    // 35% chance of having a secondary genre
    let genre2 = null;
    if (Math.random() < 0.35) {
      const others = GENRES.filter(g => g !== genre);
      genre2 = pick(others);
    }
    const mFit = randInt(40, 95);
    const isHot = mFit >= 80;
    return { id: i, genre, genre2, title: tpl.title, logline: tpl.logline, budgetMin: budMin, budgetMax: budMax, marketFit: mFit, isHot, bidPrice: isHot ? randInt(1, 5) * 1e6 : 0, rivalBidder: isHot ? pick(['Paramount', 'Universal', 'Warner Bros.', 'MGM', 'Columbia']) : null };
  });
};

// ==================== RIVAL STUDIOS DATABASE ====================
const RIVAL_STUDIOS = [
  // Classic Hollywood (pre-1970, already exist at game start for most scenarios)
  { name: 'Paramount Pictures', founded: 1912, tier: 'major', baseRep: 75, baseCash: 400e6, basePres: 55, desc: 'One of the original Big Five studios.' },
  { name: 'Warner Bros.', founded: 1923, tier: 'major', baseRep: 78, baseCash: 450e6, basePres: 60, desc: 'From talkies to tentpoles — always a powerhouse.' },
  { name: 'MGM Studios', founded: 1924, tier: 'major', baseRep: 60, baseCash: 250e6, basePres: 45, desc: 'More stars than there are in heaven.' },
  { name: 'Columbia Pictures', founded: 1924, tier: 'major', baseRep: 55, baseCash: 200e6, basePres: 35, desc: 'The scrappy studio that became a giant.' },
  { name: 'Universal Pictures', founded: 1912, tier: 'major', baseRep: 72, baseCash: 400e6, basePres: 50, desc: 'Home of monsters, blockbusters, and theme parks.' },
  { name: '20th Century Fox', founded: 1935, tier: 'major', baseRep: 70, baseCash: 380e6, basePres: 50, desc: 'A titan of the golden age and beyond.' },
  { name: 'Walt Disney Studios', founded: 1923, tier: 'major', baseRep: 80, baseCash: 500e6, basePres: 65, desc: 'The house that Mickey built — animation and beyond.' },
  { name: 'United Artists', founded: 1919, tier: 'mid', baseRep: 50, baseCash: 150e6, basePres: 40, desc: 'Founded by Chaplin, Pickford, Fairbanks, and Griffith.' },
  { name: 'RKO Pictures', founded: 1928, tier: 'mid', baseRep: 40, baseCash: 100e6, basePres: 30, desc: 'Home of Citizen Kane and King Kong.', defunct: 1959 },

  // New Hollywood era
  { name: 'New Line Cinema', founded: 1967, tier: 'indie', baseRep: 35, baseCash: 50e6, basePres: 20, desc: 'The house that Freddy built.' },
  { name: 'Lionsgate Films', founded: 1997, tier: 'mid', baseRep: 45, baseCash: 150e6, basePres: 25, desc: 'Indie spirit with blockbuster ambitions.' },
  { name: 'Miramax Films', founded: 1979, tier: 'indie', baseRep: 55, baseCash: 80e6, basePres: 45, desc: 'Indie film revolutionaries.' },
  { name: 'DreamWorks', founded: 1994, tier: 'major', baseRep: 65, baseCash: 300e6, basePres: 50, desc: 'Spielberg, Katzenberg, and Geffen dream big.' },
  { name: 'Pixar Animation', founded: 1986, tier: 'mid', baseRep: 70, baseCash: 200e6, basePres: 60, desc: 'Revolutionized animation with computer magic.' },
  { name: 'A24', founded: 2012, tier: 'indie', baseRep: 60, baseCash: 60e6, basePres: 65, desc: 'The coolest studio in town — prestige indie darlings.' },
  { name: 'Blumhouse Productions', founded: 2000, tier: 'indie', baseRep: 50, baseCash: 40e6, basePres: 20, desc: 'Micro-budget horror with massive returns.' },
  { name: 'Focus Features', founded: 2002, tier: 'indie', baseRep: 50, baseCash: 100e6, basePres: 45, desc: 'Prestige arm with an eye for quality.' },
  { name: 'Legendary Entertainment', founded: 2000, tier: 'mid', baseRep: 55, baseCash: 250e6, basePres: 30, desc: 'Big-budget spectacle and franchise builders.' },
  { name: 'STX Entertainment', founded: 2014, tier: 'indie', baseRep: 30, baseCash: 80e6, basePres: 10, desc: 'The new kids trying to crack the code.' },
  { name: 'Amblin Entertainment', founded: 1981, tier: 'mid', baseRep: 65, baseCash: 200e6, basePres: 55, desc: 'Spielberg\'s personal label — wonder and adventure.' },
  { name: 'Orion Pictures', founded: 1978, tier: 'mid', baseRep: 50, baseCash: 120e6, basePres: 35, desc: 'Brief but brilliant — Platoon, Silence of the Lambs.', defunct: 1999 },
  { name: 'TriStar Pictures', founded: 1982, tier: 'mid', baseRep: 45, baseCash: 130e6, basePres: 30, desc: 'Columbia\'s ambitious sibling.' },
  { name: 'Neon', founded: 2017, tier: 'indie', baseRep: 55, baseCash: 30e6, basePres: 55, desc: 'Parasite proved they have impeccable taste.' },
  { name: 'Annapurna Pictures', founded: 2011, tier: 'indie', baseRep: 50, baseCash: 100e6, basePres: 50, desc: 'Bold, auteur-driven filmmaking with deep pockets.' },
];

const PERSONALITY_FOR_TIER = {
  major: { aggression: [0.4, 0.7], budgetMult: [1.0, 1.5], marketingMult: [1.0, 1.5], qualityBonus: [0, 8], riskTolerance: [0.2, 0.5] },
  mid: { aggression: [0.2, 0.5], budgetMult: [0.7, 1.2], marketingMult: [0.7, 1.2], qualityBonus: [2, 10], riskTolerance: [0.3, 0.6] },
  indie: { aggression: [0.1, 0.4], budgetMult: [0.3, 0.7], marketingMult: [0.4, 0.8], qualityBonus: [5, 15], riskTolerance: [0.5, 0.9] },
};

const makeCompetitor = (studioDef) => {
  const personalities = RIVAL_PERSONALITIES;
  const personality = pick(personalities);
  const tierConfig = PERSONALITY_FOR_TIER[studioDef.tier] || PERSONALITY_FOR_TIER.mid;
  // Merge personality with tier-based overrides
  const mergedPersonality = {
    ...personality,
    aggression: tierConfig.aggression[0] + Math.random() * (tierConfig.aggression[1] - tierConfig.aggression[0]),
    budgetMult: tierConfig.budgetMult[0] + Math.random() * (tierConfig.budgetMult[1] - tierConfig.budgetMult[0]),
    marketingMult: tierConfig.marketingMult[0] + Math.random() * (tierConfig.marketingMult[1] - tierConfig.marketingMult[0]),
    qualityBonus: Math.round(tierConfig.qualityBonus[0] + Math.random() * (tierConfig.qualityBonus[1] - tierConfig.qualityBonus[0])),
    riskTolerance: tierConfig.riskTolerance[0] + Math.random() * (tierConfig.riskTolerance[1] - tierConfig.riskTolerance[0]),
  };
  return {
    name: studioDef.name,
    founded: studioDef.founded,
    tier: studioDef.tier,
    desc: studioDef.desc,
    defunct: studioDef.defunct || null,
    reputation: clamp(studioDef.baseRep + randInt(-10, 10), 20, 95),
    cash: Math.round(studioDef.baseCash * (0.8 + Math.random() * 0.4)),
    prestige: clamp(studioDef.basePres + randInt(-5, 5), 5, 80),
    filmsReleased: 0,
    totalGross: 0,
    releasesThisQ: 0,
    personality: mergedPersonality,
    awards: 0,
  };
};

const makeCompetitors = (startYear) => {
  // Only include studios that existed by the start year and aren't defunct
  const eligible = RIVAL_STUDIOS.filter(s => s.founded <= (startYear || 1970) && (!s.defunct || s.defunct > (startYear || 1970)));
  return eligible.map(s => makeCompetitor(s));
};

const RIVAL_FILM_TITLES = gameContent.rivalFilmTitles;
const RIVAL_DIRECTOR_NAMES = gameContent.rivalDirectorNames;
const RIVAL_ACTOR_NAMES = gameContent.rivalActorNames;
const RIVAL_WRITER_NAMES = gameContent.rivalWriterNames;
const RIVAL_PERSONALITIES = gameContent.rivalPersonalities;
const INDUSTRY_CRISES = gameContent.industryCrises;

// ==================== TALENT DEMANDS ====================
const TALENT_DEMANDS = [
  { id: 'genre_refuse', name: 'Genre Refusal', desc: 'Refuses to work in certain genres', weight: 0.3, generate: (skill) => { if (skill < 50) return null; const refused = [pick(GENRES)]; if (skill > 75) refused.push(pick(GENRES.filter(g => g !== refused[0]))); return { type: 'genre_refuse', genres: refused, desc: `Won't do ${refused.join(' or ')}` }; } },
  { id: 'director_pref', name: 'Director Preference', desc: 'Wants to work with a specific director', weight: 0.15, generate: (skill, contracts) => { if (skill < 60 || !contracts || contracts.length === 0) return null; const dirs = contracts.filter(t => t.type === 'director'); if (dirs.length === 0) return null; const pref = pick(dirs); return { type: 'director_pref', directorId: pref.id, directorName: pref.name, desc: `Wants to work with ${pref.name}` }; } },
  { id: 'budget_min', name: 'Budget Minimum', desc: 'Only works on big budget films', weight: 0.2, generate: (skill) => { if (skill < 65) return null; const min = Math.round((skill - 40) * 0.5) * 1e6; return { type: 'budget_min', amount: min, desc: `Only films with $${Math.round(min/1e6)}M+ budget` }; } },
  { id: 'top_billing', name: 'Top Billing', desc: 'Demands highest pay on the project', weight: 0.1, generate: (skill) => { if (skill < 70) return null; return { type: 'top_billing', desc: 'Must be highest-paid talent on film' }; } },
  { id: 'creative_control', name: 'Creative Control', desc: 'Demands director control be below 40%', weight: 0.15, generate: (skill) => { if (skill < 75) return null; return { type: 'creative_control', maxStudioControl: 40, desc: 'Studio control must be under 40%' }; } },
  { id: 'no_sequels', name: 'No Sequels', desc: 'Refuses sequel work', weight: 0.1, generate: (skill) => { if (skill < 60) return null; return { type: 'no_sequels', desc: 'Refuses to do sequels' }; } },
];

// ==================== NAMED CRITICS ====================
const NAMED_CRITICS = [
  { id: 'traditional', name: 'Margaret Chen', outlet: 'The Herald', taste: { genres: ['Drama', 'War', 'Documentary'], tones: ['serious', 'inspirational'], minBudget: 0, maxBudget: 80e6 }, weight: 1.2, contrarian: false, desc: 'Classical taste. Loves prestige dramas, dislikes blockbuster excess.' },
  { id: 'populist', name: 'Rex Morrison', outlet: 'MovieFan Weekly', taste: { genres: ['Action', 'Sci-Fi', 'Comedy', 'Animation'], tones: ['lighthearted'], minBudget: 30e6, maxBudget: 999e6 }, weight: 1.0, contrarian: false, desc: 'Loves crowd-pleasers and spectacle. The voice of mainstream audiences.' },
  { id: 'indie', name: 'Suki Nakamura', outlet: 'Celluloid & Soul', taste: { genres: ['Drama', 'Romance', 'Documentary', 'Mystery'], tones: ['dark', 'experimental'], minBudget: 0, maxBudget: 30e6 }, weight: 1.3, contrarian: false, desc: 'Champions independent cinema. Suspicious of big budgets.' },
  { id: 'horror', name: 'Dante Volkov', outlet: 'Fright Night Review', taste: { genres: ['Horror', 'Thriller', 'Mystery'], tones: ['dark'], minBudget: 0, maxBudget: 999e6 }, weight: 0.8, contrarian: true, desc: 'Genre specialist. Loves what others dismiss. Occasionally contrarian.' },
  { id: 'spectacle', name: 'James Whitfield III', outlet: 'Premiere Magazine', taste: { genres: ['Action', 'Sci-Fi', 'Fantasy', 'Animation'], tones: ['inspirational', 'lighthearted'], minBudget: 50e6, maxBudget: 999e6 }, weight: 1.1, contrarian: false, desc: 'Believes cinema should be larger than life. The bigger the better.' },
  { id: 'auteur', name: 'Claudette Moreau', outlet: 'Cahiers du Cinema', taste: { genres: ['Drama', 'Fantasy', 'Romance'], tones: ['experimental', 'dark', 'satirical'], minBudget: 0, maxBudget: 60e6 }, weight: 1.4, contrarian: true, desc: 'French new wave devotee. Rewards directorial vision, punishes formula.' },
];

// ==================== FEATURE 2: NAMED FILM CRITICS ====================
const FILM_CRITICS = [
  { id: 'stone', name: 'Margaret Stone', publication: 'The Hollywood Chronicle', style: 'Traditional', genreLove: ['Drama', 'War', 'Western'], genreHate: ['Horror', 'Animation'], qualityThreshold: 60, harshness: 0.3, desc: 'The grand dame of film criticism — 40 years of razor-sharp reviews.' },
  { id: 'chen', name: 'David Chen', publication: 'CineScope Magazine', style: 'Analytical', genreLove: ['Sci-Fi', 'Thriller', 'Mystery'], genreHate: ['Musical', 'Romance'], qualityThreshold: 55, harshness: 0.2, desc: 'Methodical and fair — audiences trust his scores.' },
  { id: 'okafor', name: 'Amara Okafor', publication: 'Global Film Review', style: 'International', genreLove: ['Drama', 'Documentary', 'Fantasy'], genreHate: ['Action'], qualityThreshold: 65, harshness: 0.4, desc: 'Champions world cinema and auteur vision.' },
  { id: 'brooks', name: 'Jake Brooks', publication: 'PopScreen Daily', style: 'Populist', genreLove: ['Action', 'Comedy', 'Animation'], genreHate: ['Documentary'], qualityThreshold: 40, harshness: 0.1, desc: 'If audiences love it, Jake loves it.' },
  { id: 'winters', name: 'Elena Winters', publication: 'Arthouse Quarterly', style: 'Elitist', genreLove: ['Drama', 'Documentary', 'Mystery'], genreHate: ['Action', 'Comedy', 'Animation'], qualityThreshold: 75, harshness: 0.6, desc: 'Notoriously picky — a positive review from her is gold.' },
  { id: 'tanaka', name: 'Kenji Tanaka', publication: 'Midnight Movies', style: 'Genre Champion', genreLove: ['Horror', 'Sci-Fi', 'Fantasy', 'Thriller'], genreHate: ['Romance', 'Musical'], qualityThreshold: 45, harshness: 0.15, desc: 'The genre film defender — horror and sci-fi deserve respect.' },
  { id: 'dupont', name: 'Claire Dupont', publication: 'Le Film Moderne', style: 'Auteurist', genreLove: ['Drama', 'Romance', 'War'], genreHate: ['Action', 'Horror'], qualityThreshold: 70, harshness: 0.5, desc: 'European sensibility meets Hollywood scrutiny.' },
  { id: 'martinez', name: 'Rico Martinez', publication: 'Box Office Insider', style: 'Commercial', genreLove: ['Action', 'Sci-Fi', 'Comedy', 'Animation'], genreHate: ['Documentary'], qualityThreshold: 35, harshness: 0.05, desc: 'Cares about spectacle and entertainment value.' },
];

const generateCriticReviews = (film) => {
  return FILM_CRITICS.map(critic => {
    let score = film.quality || 50;
    if (critic.genreLove.includes(film.genre)) score += 12;
    if (critic.genreHate.includes(film.genre)) score -= 15;
    if (film.genre2 && critic.genreLove.includes(film.genre2)) score += 6;
    if (film.genre2 && critic.genreHate.includes(film.genre2)) score -= 8;
    score -= critic.harshness * 15;
    if (critic.style === 'Elitist' && film.budget > 80e6) score -= 8;
    if (critic.style === 'Populist' && film.budget > 50e6) score += 5;
    if (critic.style === 'Commercial' && film.budget > 80e6) score += 8;
    score += (Math.random() - 0.5) * 10;
    score = Math.round(clamp(score, 5, 100));
    let verdict;
    if (score >= 85) verdict = pick(['Masterpiece', 'Extraordinary', 'A triumph', 'Essential viewing', 'Instant classic']);
    else if (score >= 70) verdict = pick(['Impressive', 'Strong work', 'Well-crafted', 'Engaging', 'Recommended']);
    else if (score >= 55) verdict = pick(['Decent', 'Mixed bag', 'Has moments', 'Uneven but watchable', 'Middle of the road']);
    else if (score >= 40) verdict = pick(['Disappointing', 'Below expectations', 'Misses the mark', 'Forgettable', 'Underdeveloped']);
    else verdict = pick(['Terrible', 'Avoid at all costs', 'A disaster', 'Painful to sit through', 'Career low']);
    return { criticId: critic.id, name: critic.name, publication: critic.publication, score, verdict };
  });
};

// ==================== FEATURE 5: PRODUCTION SCANDALS ====================
const PRODUCTION_SCANDALS = [
  { id: 'actor_arrest', name: 'Lead Actor Arrested', chance: 0.02, qualityHit: -8, buzzChange: 15, repChange: -5, costIncrease: 0.1, desc: 'Your lead actor made headlines for all the wrong reasons.' },
  { id: 'director_walkout', name: 'Director Walks Off Set', chance: 0.015, qualityHit: -12, buzzChange: 5, repChange: -3, costIncrease: 0.2, desc: 'Creative differences led to an explosive departure.' },
  { id: 'leaked_footage', name: 'Footage Leaked Online', chance: 0.03, qualityHit: 0, buzzChange: 20, repChange: -2, costIncrease: 0, desc: 'Raw footage hit the internet — buzz is up but you lost the surprise.' },
  { id: 'onset_accident', name: 'On-Set Accident', chance: 0.01, qualityHit: -5, buzzChange: -5, repChange: -8, costIncrease: 0.15, desc: 'A serious accident halted production and drew scrutiny.' },
  { id: 'plagiarism_claim', name: 'Plagiarism Accusation', chance: 0.02, qualityHit: 0, buzzChange: 10, repChange: -6, costIncrease: 0.05, desc: 'Another writer claims your script was stolen from them.' },
  { id: 'budget_scandal', name: 'Financial Mismanagement', chance: 0.015, qualityHit: -3, buzzChange: 0, repChange: -4, costIncrease: 0.25, desc: 'Accounting irregularities surfaced — costs spiral.' },
  { id: 'star_feud', name: 'Cast Feud Goes Public', chance: 0.025, qualityHit: -5, buzzChange: 25, repChange: -2, costIncrease: 0.05, desc: 'Your stars are at war — tabloids are loving it.' },
  { id: 'test_disaster', name: 'Test Screening Disaster', chance: 0.02, qualityHit: -6, buzzChange: -10, repChange: -3, costIncrease: 0.1, desc: 'Audiences hated the cut. Major reshoots needed.' },
];

// ==================== FEATURE 6: INTERNATIONAL BOX OFFICE ====================
const INTERNATIONAL_MARKETS = [
  { id: 'china', name: 'China', sharePct: 0.25, genreBonus: { Action: 0.3, 'Sci-Fi': 0.2, Fantasy: 0.15, Animation: 0.1 }, genrePenalty: { Horror: -0.3, Western: -0.2, War: -0.15 }, censorship: true },
  { id: 'europe', name: 'Europe', sharePct: 0.20, genreBonus: { Drama: 0.2, Thriller: 0.15, Comedy: 0.1, Romance: 0.1 }, genrePenalty: {}, censorship: false },
  { id: 'japan', name: 'Japan', sharePct: 0.08, genreBonus: { Animation: 0.3, Horror: 0.15, 'Sci-Fi': 0.1 }, genrePenalty: { Western: -0.2 }, censorship: false },
  { id: 'uk', name: 'United Kingdom', sharePct: 0.10, genreBonus: { Drama: 0.15, Comedy: 0.15, War: 0.1 }, genrePenalty: {}, censorship: false },
  { id: 'latam', name: 'Latin America', sharePct: 0.08, genreBonus: { Action: 0.15, Comedy: 0.2, Horror: 0.1, Romance: 0.15 }, genrePenalty: {}, censorship: false },
  { id: 'korea', name: 'South Korea', sharePct: 0.05, genreBonus: { Thriller: 0.2, Horror: 0.15, Action: 0.1, Drama: 0.1 }, genrePenalty: {}, censorship: false },
  { id: 'india', name: 'India', sharePct: 0.06, genreBonus: { Musical: 0.3, Drama: 0.2, Action: 0.15, Romance: 0.2 }, genrePenalty: {}, censorship: false },
  { id: 'oceania', name: 'Australia/NZ', sharePct: 0.04, genreBonus: { Action: 0.1, Comedy: 0.1, Horror: 0.1 }, genrePenalty: {}, censorship: false },
  { id: 'mena', name: 'Middle East/Africa', sharePct: 0.04, genreBonus: { Action: 0.15, Drama: 0.1 }, genrePenalty: { Horror: -0.1 }, censorship: true },
  { id: 'sea', name: 'Southeast Asia', sharePct: 0.05, genreBonus: { Action: 0.2, Horror: 0.15, Comedy: 0.1 }, genrePenalty: {}, censorship: false },
];

const calcInternationalGross = (domesticGross, genre, quality, film) => {
  let intlTotal = 0;
  const breakdown = [];
  INTERNATIONAL_MARKETS.forEach(market => {
    let base = domesticGross * market.sharePct;
    const genreBonus = market.genreBonus[genre] || 0;
    const genrePenalty = market.genrePenalty[genre] || 0;
    base *= (1 + genreBonus + genrePenalty);
    if (quality >= 80) base *= 1.3;
    else if (quality >= 60) base *= 1.1;
    else if (quality < 40) base *= 0.6;
    if (market.censorship && (genre === 'Horror' || quality < 30)) base *= 0.5;
    if (film && film.actor && film.actor.traitEffect?.intlBonus) base *= (1 + film.actor.traitEffect.intlBonus);
    base = Math.round(base);
    intlTotal += base;
    breakdown.push({ market: market.name, gross: base });
  });
  return { total: intlTotal, breakdown };
};

// ==================== AUDIENCE DEMOGRAPHICS ====================
const DEMOGRAPHICS = [
  { name: 'Teen', ages: '13-17', share: 0.15, genrePrefs: { Horror: 1.4, Comedy: 1.3, Action: 1.2, Romance: 1.1, Animation: 1.0 }, ratingPrefs: { G: 0.5, PG: 0.8, 'PG-13': 1.4, R: 0.7, 'NC-17': 0.1 }, marketingSensitivity: 1.3 },
  { name: 'Young Adult', ages: '18-29', share: 0.25, genrePrefs: { Action: 1.3, Horror: 1.2, 'Sci-Fi': 1.3, Comedy: 1.2, Thriller: 1.1 }, ratingPrefs: { G: 0.3, PG: 0.5, 'PG-13': 1.2, R: 1.4, 'NC-17': 0.8 }, marketingSensitivity: 1.1 },
  { name: 'Adult', ages: '30-49', share: 0.30, genrePrefs: { Drama: 1.3, Thriller: 1.3, Action: 1.1, Documentary: 1.2, Mystery: 1.2 }, ratingPrefs: { G: 0.4, PG: 0.7, 'PG-13': 1.2, R: 1.3, 'NC-17': 0.6 }, marketingSensitivity: 0.9 },
  { name: 'Family', ages: 'Parents+Kids', share: 0.20, genrePrefs: { Animation: 1.6, Comedy: 1.3, Fantasy: 1.3, Musical: 1.2, Sports: 1.1 }, ratingPrefs: { G: 1.6, PG: 1.4, 'PG-13': 0.8, R: 0.2, 'NC-17': 0.0 }, marketingSensitivity: 1.0 },
  { name: 'Senior', ages: '50+', share: 0.10, genrePrefs: { Drama: 1.4, Documentary: 1.3, War: 1.3, Western: 1.2, Musical: 1.2, Romance: 1.1 }, ratingPrefs: { G: 1.0, PG: 1.2, 'PG-13': 1.1, R: 0.7, 'NC-17': 0.2 }, marketingSensitivity: 0.7 },
];

// ==================== RATINGS BOARD ====================
const FILM_RATINGS = [
  { rating: 'G', name: 'General Audiences', audienceReach: 0.75, desc: 'All ages. Safe but limited adult appeal.', controversyRisk: 0 },
  { rating: 'PG', name: 'Parental Guidance', audienceReach: 0.90, desc: 'Broad appeal. The sweet spot for family films.', controversyRisk: 0.02 },
  { rating: 'PG-13', name: 'Parents Strongly Cautioned', audienceReach: 1.0, desc: 'Maximum reach. Most blockbusters target this.', controversyRisk: 0.05 },
  { rating: 'R', name: 'Restricted', audienceReach: 0.70, desc: 'Adults only in theaters. Limits family audience.', controversyRisk: 0.10 },
  { rating: 'NC-17', name: 'Adults Only', audienceReach: 0.30, desc: 'Very limited distribution. High controversy risk but cult potential.', controversyRisk: 0.25 },
];

const getAutoRating = (genre, quality, budget) => {
  // Heuristic: some genres lean toward certain ratings
  const ratingWeights = { G: 0, PG: 0, 'PG-13': 0, R: 0, 'NC-17': 0 };
  if (['Animation', 'Musical'].includes(genre)) { ratingWeights.G += 3; ratingWeights.PG += 4; ratingWeights['PG-13'] += 1; }
  else if (['Horror'].includes(genre)) { ratingWeights.R += 4; ratingWeights['PG-13'] += 2; ratingWeights['NC-17'] += 1; }
  else if (['Action', 'Sci-Fi', 'Fantasy', 'Sports'].includes(genre)) { ratingWeights['PG-13'] += 5; ratingWeights.R += 2; }
  else if (['Drama', 'Thriller', 'War', 'Mystery'].includes(genre)) { ratingWeights['PG-13'] += 3; ratingWeights.R += 3; }
  else if (['Documentary'].includes(genre)) { ratingWeights.PG += 3; ratingWeights['PG-13'] += 3; ratingWeights.R += 1; }
  else if (['Comedy', 'Romance'].includes(genre)) { ratingWeights['PG-13'] += 4; ratingWeights.R += 2; ratingWeights.PG += 1; }
  else if (['Western'].includes(genre)) { ratingWeights['PG-13'] += 3; ratingWeights.R += 3; }
  // High budget pushes toward PG-13 for max reach
  if (budget > 100e6) { ratingWeights['PG-13'] += 3; ratingWeights.G -= 1; ratingWeights.R -= 1; }
  // Pick weighted random
  const entries = Object.entries(ratingWeights).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [rating, w] of entries) { r -= w; if (r <= 0) return rating; }
  return 'PG-13';
};

// ==================== REMASTER FORMATS ====================
const REMASTER_FORMATS = [
  { id: 'vhs', name: 'VHS Release', minYear: 1980, maxYear: 2000, cost: 500000, revenueMult: 0.08, qualityReq: 50, desc: 'Home video release for the VHS era.' },
  { id: 'dvd', name: 'DVD Special Edition', minYear: 1997, maxYear: 2015, cost: 1000000, revenueMult: 0.12, qualityReq: 55, desc: 'DVD with bonus features and commentary.' },
  { id: 'bluray', name: 'Blu-ray Remaster', minYear: 2006, maxYear: 2030, cost: 2000000, revenueMult: 0.15, qualityReq: 60, desc: 'HD remaster with improved audio and video.' },
  { id: 'imax', name: 'IMAX Re-release', minYear: 2010, maxYear: 2060, cost: 5000000, revenueMult: 0.20, qualityReq: 75, desc: 'Theatrical IMAX re-release. Only for beloved classics.' },
  { id: '4k_hdr', name: '4K HDR Restoration', minYear: 2018, maxYear: 2080, cost: 3000000, revenueMult: 0.18, qualityReq: 65, desc: 'Full 4K restoration with HDR grading.' },
];

// ==================== STUDIO LOTS ====================
const STUDIO_LOTS = [
  { id: 'soundstage_small', name: 'Small Soundstage', cost: 2e6, monthlyUpkeep: 50000, rentalIncome: 80000, capacity: 1, qualityBonus: 1, genres: null, desc: 'Basic indoor filming. Works for any genre.' },
  { id: 'soundstage_large', name: 'Large Soundstage', cost: 8e6, monthlyUpkeep: 150000, rentalIncome: 250000, capacity: 2, qualityBonus: 2, genres: null, desc: 'Spacious stage for complex sets and action sequences.' },
  { id: 'backlot_western', name: 'Western Backlot', cost: 5e6, monthlyUpkeep: 80000, rentalIncome: 120000, capacity: 1, qualityBonus: 5, genres: ['Western', 'War', 'Action'], desc: 'Outdoor frontier town. Perfect for Westerns and period pieces.' },
  { id: 'water_tank', name: 'Water Tank Stage', cost: 12e6, monthlyUpkeep: 200000, rentalIncome: 350000, capacity: 1, qualityBonus: 5, genres: ['Action', 'Sci-Fi', 'Fantasy'], desc: 'Massive water tank for naval battles, underwater scenes, and flooding.' },
  { id: 'vfx_stage', name: 'VFX Green Screen Stage', cost: 10e6, monthlyUpkeep: 180000, rentalIncome: 300000, capacity: 2, qualityBonus: 4, genres: ['Sci-Fi', 'Fantasy', 'Animation', 'Action'], desc: 'State-of-the-art green screen for visual effects work.' },
  { id: 'intimate_set', name: 'Intimate Drama Stage', cost: 3e6, monthlyUpkeep: 60000, rentalIncome: 100000, capacity: 1, qualityBonus: 3, genres: ['Drama', 'Romance', 'Thriller', 'Mystery'], desc: 'Carefully designed for close-up work and emotional performances.' },
];

// ==================== FILMING LOCATIONS ====================
const FILMING_LOCATIONS = [
  { id: 'hollywood', name: 'Hollywood, USA', taxBreak: 0, qualityBonus: 3, costMult: 1.0, desc: 'The heart of the industry. No tax breaks but top talent access.' },
  { id: 'nyc', name: 'New York City, USA', taxBreak: 0.05, qualityBonus: 4, costMult: 1.1, desc: 'Gritty urban settings. Small tax incentive.' },
  { id: 'london', name: 'London, UK', taxBreak: 0.15, qualityBonus: 5, costMult: 0.9, desc: 'World-class studios and crew. Strong tax relief.' },
  { id: 'nz', name: 'New Zealand', taxBreak: 0.20, qualityBonus: 6, costMult: 0.75, desc: 'Epic landscapes. Major tax incentives for large productions.' },
  { id: 'vancouver', name: 'Vancouver, Canada', taxBreak: 0.18, qualityBonus: 2, costMult: 0.80, desc: 'Hollywood North. Great tax breaks, versatile locations.' },
  { id: 'prague', name: 'Prague, Czech Republic', taxBreak: 0.22, qualityBonus: 3, costMult: 0.65, desc: 'Cheap production costs. Beautiful period architecture.' },
  { id: 'seoul', name: 'Seoul, South Korea', taxBreak: 0.10, qualityBonus: 4, costMult: 0.70, desc: 'Cutting-edge tech. Growing film industry hub.' },
  { id: 'mumbai', name: 'Mumbai, India', taxBreak: 0.12, qualityBonus: 3, costMult: 0.55, desc: 'Massive local market. Very low production costs.' },
];

// ==================== TECH TREE ====================
const TECH_TREE = [
  { id: 'color_film', name: 'Color Film Mastery', year: 1970, cost: 500000, qualityBonus: 2, desc: 'Perfect color grading and film stock techniques.', unlocks: 'Enhanced visual quality' },
  { id: 'dolby_sound', name: 'Dolby Stereo Sound', year: 1975, cost: 1000000, qualityBonus: 3, desc: 'Immersive stereo sound design.', unlocks: 'Better audience immersion' },
  { id: 'steadicam', name: 'Steadicam Technology', year: 1978, cost: 800000, qualityBonus: 3, desc: 'Smooth handheld camera movement.', unlocks: 'Dynamic cinematography' },
  { id: 'practical_fx', name: 'Advanced Practical Effects', year: 1982, cost: 2000000, qualityBonus: 5, desc: 'State-of-the-art animatronics and prosthetics.', unlocks: '+5 quality on Horror/Sci-Fi' },
  { id: 'early_cgi', name: 'Early CGI', year: 1990, cost: 5000000, qualityBonus: 6, desc: 'Computer-generated imagery revolutionizes visual effects.', unlocks: 'VFX-heavy films possible' },
  { id: 'digital_editing', name: 'Digital Non-Linear Editing', year: 1995, cost: 3000000, qualityBonus: 4, desc: 'Avid/Final Cut Pro speeds up post-production.', unlocks: '-1 post-production turn' },
  { id: 'digital_cinema', name: 'Digital Cinema Cameras', year: 2002, cost: 8000000, qualityBonus: 5, desc: 'Film-quality digital capture reduces costs.', unlocks: '-10% production costs' },
  { id: 'motion_capture', name: 'Motion Capture', year: 2005, cost: 12000000, qualityBonus: 7, desc: 'Gollum-quality performance capture.', unlocks: '+7 quality on Animation/Fantasy' },
  { id: 'imax_3d', name: 'IMAX & 3D Filmmaking', year: 2009, cost: 15000000, qualityBonus: 4, desc: 'Premium large-format and stereoscopic cinema.', unlocks: '+15% domestic gross on Action/Sci-Fi' },
  { id: 'streaming_tech', name: 'Streaming Infrastructure', year: 2015, cost: 20000000, qualityBonus: 2, desc: 'Build your own streaming delivery pipeline.', unlocks: 'Streaming platform costs -20%' },
  { id: 'virtual_production', name: 'Virtual Production (LED Volume)', year: 2020, cost: 25000000, qualityBonus: 8, desc: 'The Mandalorian-style virtual sets.', unlocks: '-15% costs, +8 quality' },
  { id: 'ai_tools', name: 'AI-Assisted Filmmaking', year: 2030, cost: 30000000, qualityBonus: 6, desc: 'AI helps with pre-viz, editing, and effects.', unlocks: '-1 development turn' },
  { id: 'full_cgi_actors', name: 'Photorealistic Digital Actors', year: 2045, cost: 50000000, qualityBonus: 5, desc: 'Digital humans indistinguishable from real actors.', unlocks: 'Reduce actor salary costs by 25%' },
  { id: 'neural_filmmaking', name: 'Neural Direct Filmmaking', year: 2070, cost: 80000000, qualityBonus: 10, desc: 'Directors think and the scene renders.', unlocks: '+10 quality, -2 production turns' },
  { id: 'holographic_cinema', name: 'Holographic Cinema', year: 2095, cost: 120000000, qualityBonus: 8, desc: 'Full holographic projection in theaters.', unlocks: '+30% domestic gross' },
  { id: 'quantum_render', name: 'Quantum Rendering Engine', year: 2120, cost: 200000000, qualityBonus: 10, desc: 'Unlimited visual fidelity via quantum computing.', unlocks: '+10 quality on all VFX films' },
  { id: 'consciousness_cinema', name: 'Consciousness Cinema', year: 2150, cost: 500000000, qualityBonus: 15, desc: 'Audiences experience films as lucid dreams.', unlocks: '+50% all gross, +15 quality' },
];

// ==================== SYSTEM 1: FILMMAKING ERAS ====================
const FILMMAKING_ERAS = [
  { id: 'silent', name: 'Silent Era', startYear: 0, endYear: 1927, qualityMod: -10, budgetMult: 0.3, maxBudget: 1, maxMarketing: 0.5, genreLimit: ['Drama','Comedy','Horror','Romance','Western'], techDesc: 'No sound — visual storytelling only.', announcement: 'The dawn of cinema.' },
  { id: 'golden', name: 'Golden Age of Hollywood', startYear: 1927, endYear: 1948, qualityMod: -5, budgetMult: 0.5, maxBudget: 5, maxMarketing: 3, genreLimit: ['Drama','Comedy','Horror','Romance','Western','Musical','War','Mystery'], techDesc: 'Talkies arrive. Studio system dominance.', announcement: 'Sound revolutionizes cinema!' },
  { id: 'postwar', name: 'Post-War Cinema', startYear: 1948, endYear: 1960, qualityMod: -3, budgetMult: 0.6, maxBudget: 10, maxMarketing: 6, genreLimit: null, techDesc: 'TV competition. Widescreen and color.', announcement: 'Television threatens — Hollywood adapts with spectacle.' },
  { id: 'newHollywood', name: 'New Hollywood', startYear: 1960, endYear: 1980, qualityMod: 0, budgetMult: 0.8, maxBudget: 40, maxMarketing: 25, genreLimit: null, techDesc: 'Auteur directors. Gritty realism.', announcement: 'A new generation of filmmakers takes control.' },
  { id: 'blockbuster', name: 'Blockbuster Era', startYear: 1980, endYear: 1995, qualityMod: 2, budgetMult: 1.0, maxBudget: 100, maxMarketing: 65, genreLimit: null, techDesc: 'Tentpoles, VHS, and merchandise.', announcement: 'The age of the blockbuster begins!' },
  { id: 'digital', name: 'Digital Revolution', startYear: 1995, endYear: 2005, qualityMod: 3, budgetMult: 1.1, maxBudget: 200, maxMarketing: 130, genreLimit: null, techDesc: 'CGI transforms filmmaking. DVD sales boom.', announcement: 'Digital filmmaking changes everything.' },
  { id: 'franchise', name: 'Franchise Dominance', startYear: 2005, endYear: 2015, qualityMod: 3, budgetMult: 1.3, maxBudget: 250, maxMarketing: 165, genreLimit: null, techDesc: 'IP is king. Shared universes. 3D.', announcement: 'Franchises and shared universes dominate.' },
  { id: 'streaming', name: 'Streaming Disruption', startYear: 2015, endYear: 2025, qualityMod: 4, budgetMult: 1.4, maxBudget: 300, maxMarketing: 200, genreLimit: null, techDesc: 'Theaters vs streaming. Peak TV.', announcement: 'Streaming reshapes the industry!' },
  { id: 'aiAge', name: 'AI & Virtual Production', startYear: 2025, endYear: 2045, qualityMod: 5, budgetMult: 1.5, maxBudget: 350, maxMarketing: 230, genreLimit: null, techDesc: 'AI tools and LED volumes.', announcement: 'AI and virtual production emerge.' },
  { id: 'immersive', name: 'Immersive Cinema', startYear: 2045, endYear: 2080, qualityMod: 7, budgetMult: 1.8, maxBudget: 400, maxMarketing: 260, genreLimit: null, techDesc: 'Holographic and VR experiences.', announcement: 'Cinema becomes immersive experience.' },
  { id: 'neural', name: 'Neural Cinema', startYear: 2080, endYear: 9999, qualityMod: 10, budgetMult: 2.0, maxBudget: 400, maxMarketing: 260, genreLimit: null, techDesc: 'Direct neural storytelling.', announcement: 'Neural cinema: audiences live the story.' },
];

const getCurrentFilmEra = (year) => FILMMAKING_ERAS.slice().reverse().find(e => year >= e.startYear) || FILMMAKING_ERAS[0];

// ==================== SYSTEM 2: ACQUISITION TARGETS ====================
const ACQUISITION_TARGETS = [
  { id: 'talent_agency', name: 'Talent Agency', type: 'agency', baseCost: 50e6, benefit: 'All hiring costs -20%. Exclusive first pick of new talent.', benefitEffect: { hiringDiscount: 0.20, talentPriority: true } },
  { id: 'vfx_house', name: 'VFX House', type: 'production', baseCost: 80e6, benefit: '+10 quality on VFX-heavy genres. -15% VFX budget.', benefitEffect: { vfxQuality: 10, vfxDiscount: 0.15 } },
  { id: 'music_label', name: 'Music Label', type: 'production', baseCost: 40e6, benefit: 'Soundtrack revenue +200%. +5 quality on Musical.', benefitEffect: { soundtrackMult: 3, musicalQuality: 5 } },
  { id: 'animation_studio', name: 'Animation Studio', type: 'production', baseCost: 120e6, benefit: '+15 quality on Animation. -20% Animation costs.', benefitEffect: { animQuality: 15, animDiscount: 0.20 } },
  { id: 'indie_label', name: 'Indie Distribution Label', type: 'distribution', baseCost: 30e6, benefit: '+15 prestige per film. Sundance/Cannes access boost.', benefitEffect: { prestigeBonus: 15, festivalBoost: true } },
  { id: 'streaming_tech', name: 'Streaming Tech Company', type: 'tech', baseCost: 150e6, benefit: 'Streaming infrastructure -30%. +5M subscriber capacity.', benefitEffect: { streamDiscount: 0.30, subCapBonus: 5e6 } },
];

// ==================== SYSTEM 3: ECONOMIC CYCLES ====================
const ECONOMIC_CYCLES = [
  { id: 'boom', name: 'Economic Boom', grossMult: 1.25, budgetInflation: 1.1, talentCostMult: 1.15, duration: [24, 48], desc: 'Spending is up — audiences flock to theaters.' },
  { id: 'stable', name: 'Stable Economy', grossMult: 1.0, budgetInflation: 1.0, talentCostMult: 1.0, duration: [36, 72], desc: 'Steady economic conditions.' },
  { id: 'recession', name: 'Recession', grossMult: 0.75, budgetInflation: 0.9, talentCostMult: 0.85, duration: [12, 36], desc: 'Belt-tightening everywhere. Cheaper talent, lower grosses.' },
  { id: 'depression', name: 'Depression', grossMult: 0.55, budgetInflation: 0.75, talentCostMult: 0.7, duration: [12, 24], desc: 'Severe downturn. Only escapist content thrives.' },
];

// ==================== SYSTEM 3: AI STUDIOS ====================
const AI_STUDIOS = [
  { name: 'SynthFilm AI', founded: 2028, strategy: 'volume', filmsPerYear: 20, avgBudget: 15e6, qualityRange: [30, 65], desc: 'Churns out cheap AI-generated content at massive scale.' },
  { name: 'DeepMind Pictures', founded: 2030, strategy: 'prestige', filmsPerYear: 5, avgBudget: 80e6, qualityRange: [60, 90], desc: 'AI-crafted prestige films that win awards.' },
  { name: 'NeuralVerse Studios', founded: 2032, strategy: 'franchise', filmsPerYear: 8, avgBudget: 120e6, qualityRange: [50, 80], desc: 'AI builds infinite franchise expansions.' },
  { name: 'AutoDirector', founded: 2035, strategy: 'niche', filmsPerYear: 12, avgBudget: 5e6, qualityRange: [40, 70], desc: 'Hyper-personalized films for niche audiences.' },
  { name: 'Prometheus AI', founded: 2040, strategy: 'blockbuster', filmsPerYear: 6, avgBudget: 200e6, qualityRange: [55, 85], desc: 'AI-driven blockbusters with perfect market optimization.' },
];

// ==================== SYSTEM 3: WORLD EVENTS ====================
const WORLD_EVENTS = [
  { id: 'pandemic_2020', name: 'Global Pandemic', triggerYear: 2020, duration: 18, grossMult: 0.35, streamingBoost: 2.0, productionDelay: 3, desc: 'Theaters shut down worldwide. Streaming surges.', unique: true },
  { id: 'writers_strike_2023', name: "Writers' Guild Strike", triggerYear: 2023, duration: 6, productionDelay: 2, qualityMod: -5, desc: 'Writers walk out. Productions halt.', unique: true },
  { id: 'actors_strike_2023', name: 'SAG-AFTRA Strike', triggerYear: 2023, duration: 4, productionDelay: 2, talentCostMult: 1.3, desc: 'Actors demand fair AI compensation.', unique: true },
  { id: 'metaverse_hype', name: 'Metaverse Hype Cycle', triggerYear: 2027, duration: 24, genreBoost: { 'Sci-Fi': 0.2, Animation: 0.15 }, desc: 'Virtual worlds captivate public imagination.' },
  { id: 'ai_regulation', name: 'AI Content Regulation', triggerYear: 2030, duration: 36, qualityMod: -3, budgetMult: 1.1, desc: 'Governments regulate AI in filmmaking.' },
  { id: 'fusion_power', name: 'Fusion Power Revolution', triggerYear: 2050, duration: 48, budgetMult: 0.85, qualityMod: 3, desc: 'Cheap energy transforms production costs.' },
];

// ==================== SYSTEM 4: LABOR RELATIONS ====================
const LABOR_RELATIONS = {
  excellent: { name: 'Excellent', costMod: 1.05, qualityMod: 5, strikeChance: 0.0, desc: 'Unions love working with you.' },
  good: { name: 'Good', costMod: 1.0, qualityMod: 2, strikeChance: 0.01, desc: 'Smooth labor relations.' },
  neutral: { name: 'Neutral', costMod: 1.0, qualityMod: 0, strikeChance: 0.03, desc: 'Standard industry relations.' },
  poor: { name: 'Poor', costMod: 0.95, qualityMod: -3, strikeChance: 0.08, desc: 'Tension with unions.' },
  hostile: { name: 'Hostile', costMod: 0.90, qualityMod: -8, strikeChance: 0.15, desc: 'Workers may walk out.' },
};

// ==================== SYSTEM 4: CAREER STAGES ====================
const CAREER_STAGES = [
  { id: 'unknown', name: 'Unknown', salaryMult: 0.3, qualityMod: -5, popularityRange: [5, 25], desc: 'Nobody knows them yet.' },
  { id: 'rising', name: 'Rising Star', salaryMult: 0.6, qualityMod: 0, popularityRange: [20, 50], desc: 'Critics and audiences are noticing.' },
  { id: 'aList', name: 'A-List', salaryMult: 1.2, qualityMod: 5, popularityRange: [60, 90], desc: 'Top of the industry.' },
  { id: 'established', name: 'Established', salaryMult: 1.0, qualityMod: 3, popularityRange: [45, 75], desc: 'Reliable and respected.' },
  { id: 'declining', name: 'Declining', salaryMult: 0.7, qualityMod: -3, popularityRange: [20, 50], desc: 'Past their prime.' },
  { id: 'comeback', name: 'Comeback', salaryMult: 0.9, qualityMod: 8, popularityRange: [40, 70], desc: 'Against all odds, they\'re back!' },
  { id: 'legendary', name: 'Legendary', salaryMult: 1.5, qualityMod: 10, popularityRange: [70, 99], desc: 'An icon of cinema.' },
];

const getCareerStage = (talent) => {
  if (!talent) return CAREER_STAGES[0];
  const films = talent.filmography || 0;
  const hits = talent.consecutiveHits || 0;
  const age = talent.age || 25;
  const popularity = talent.popularity || 30;

  if (age >= 55 && films >= 20 && popularity >= 70) return CAREER_STAGES.find(s => s.id === 'legendary');
  if (talent._wasDeclined && hits >= 2) return CAREER_STAGES.find(s => s.id === 'comeback');
  if (age >= 50 && popularity < 40) return CAREER_STAGES.find(s => s.id === 'declining');
  if (popularity >= 70 && films >= 5) return CAREER_STAGES.find(s => s.id === 'aList');
  if (films >= 8 && popularity >= 40) return CAREER_STAGES.find(s => s.id === 'established');
  if (films >= 2 || popularity >= 30) return CAREER_STAGES.find(s => s.id === 'rising');
  return CAREER_STAGES[0];
};

// ==================== SYSTEM 4: AGENT DEAL TYPES ====================
const AGENT_DEAL_TYPES = [
  { id: 'standard', name: 'Standard Contract', salaryMult: 1.0, years: 3, desc: 'Basic deal — annual salary, no frills.' },
  { id: 'option', name: 'Option Deal', salaryMult: 0.7, years: 1, optionYears: 2, desc: '1-year deal with 2-year option. Cheaper but they can walk.' },
  { id: 'backend', name: 'Back-End Deal', salaryMult: 0.5, profitSharePct: 5, years: 3, desc: 'Lower salary, 5% of net profits per film.' },
  { id: 'exclusive', name: 'Exclusive Multi-Year', salaryMult: 1.4, years: 5, exclusive: true, desc: 'Premium deal — they work only for you.' },
  { id: 'perFilm', name: 'Per-Film Deal', salaryMult: 1.3, years: 0, perFilm: true, desc: 'No commitment — hire per project at premium rates.' },
];

// ==================== CULTURAL MOVEMENTS ====================
const CULTURAL_MOVEMENTS = [
  { name: 'Civil Rights Movement', startYear: 1970, endYear: 1985, genreBoost: { Drama: 0.2, Documentary: 0.3 }, prestigeBonus: 3, desc: 'Social justice films resonate deeply.' },
  { name: 'Counterculture & New Wave', startYear: 1970, endYear: 1982, genreBoost: { Drama: 0.15, Comedy: 0.1, Western: 0.1 }, prestigeBonus: 2, desc: 'Anti-establishment storytelling thrives.' },
  { name: 'Cold War Paranoia', startYear: 1975, endYear: 1992, genreBoost: { Thriller: 0.25, 'Sci-Fi': 0.15, War: 0.2 }, prestigeBonus: 1, desc: 'Spy thrillers and nuclear anxiety dominate.' },
  { name: 'MTV & Pop Culture Explosion', startYear: 1982, endYear: 1998, genreBoost: { Comedy: 0.2, Musical: 0.2, Action: 0.15 }, prestigeBonus: 0, desc: 'Music videos influence film aesthetics.' },
  { name: 'PC Culture Wars', startYear: 1992, endYear: 2008, genreBoost: { Drama: 0.1, Comedy: -0.1, Documentary: 0.15 }, prestigeBonus: 1, desc: 'Sensitivity around content shifts audience expectations.' },
  { name: 'Post-9/11 Security State', startYear: 2001, endYear: 2018, genreBoost: { Thriller: 0.2, War: 0.25, Action: 0.15 }, prestigeBonus: 1, desc: 'War on terror permeates storytelling.' },
  { name: 'Social Media Revolution', startYear: 2010, endYear: 2035, genreBoost: { Documentary: 0.2, Horror: 0.15, Comedy: 0.1 }, prestigeBonus: 0, desc: 'Viral marketing and influencer culture reshape audiences.' },
  { name: 'Climate Crisis Awareness', startYear: 2020, endYear: 2060, genreBoost: { Documentary: 0.25, 'Sci-Fi': 0.2, Drama: 0.1 }, prestigeBonus: 2, desc: 'Environmental themes gain urgency.' },
  { name: 'AI Ethics Debate', startYear: 2028, endYear: 2065, genreBoost: { 'Sci-Fi': 0.3, Thriller: 0.15, Documentary: 0.15 }, prestigeBonus: 2, desc: 'Questions of consciousness and rights.' },
  { name: 'Space Colonization Fever', startYear: 2045, endYear: 2100, genreBoost: { 'Sci-Fi': 0.3, Action: 0.15, Documentary: 0.15 }, prestigeBonus: 1, desc: 'Humanity reaches for the stars.' },
  { name: 'Post-Human Identity', startYear: 2070, endYear: 2130, genreBoost: { 'Sci-Fi': 0.25, Drama: 0.2, Fantasy: 0.15 }, prestigeBonus: 3, desc: 'What does it mean to be human?' },
  { name: 'Virtual Reality Immersion', startYear: 2080, endYear: 2150, genreBoost: { 'Sci-Fi': 0.2, Fantasy: 0.2, Action: 0.15 }, prestigeBonus: 1, desc: 'The line between film and experience blurs.' },
  { name: 'Galactic Multiculturalism', startYear: 2110, endYear: 2180, genreBoost: { 'Sci-Fi': 0.2, Drama: 0.15, Comedy: 0.1, Documentary: 0.1 }, prestigeBonus: 2, desc: 'Stories from across the solar system.' },
  { name: 'Nostalgia Cycles', startYear: 2140, endYear: 2200, genreBoost: { Musical: 0.2, Western: 0.15, War: 0.1, Romance: 0.15 }, prestigeBonus: 1, desc: 'Every era gets its revival.' },
  { name: 'Consciousness Expansion', startYear: 2170, endYear: 2200, genreBoost: { 'Sci-Fi': 0.3, Fantasy: 0.25, Mystery: 0.2 }, prestigeBonus: 3, desc: 'New forms of awareness reshape all art.' },
];

const getActiveMovements = (year) => CULTURAL_MOVEMENTS.filter(m => year >= m.startYear && year <= m.endYear);
const getMovementBoost = (year, genre) => getActiveMovements(year).reduce((sum, m) => sum + (m.genreBoost[genre] || 0), 0);

// ==================== GENRE TREND CYCLES (SYSTEM 1) ====================
const GENRE_CYCLES = {
  boom: { label: 'Boom', grossMult: 1.4, audienceMod: 12, desc: 'Audiences can\'t get enough!' },
  rising: { label: 'Rising', grossMult: 1.15, audienceMod: 5, desc: 'Growing interest.' },
  stable: { label: 'Stable', grossMult: 1.0, audienceMod: 0, desc: 'Steady audience.' },
  declining: { label: 'Declining', grossMult: 0.85, audienceMod: -5, desc: 'Audiences are tiring.' },
  fatigued: { label: 'Fatigued', grossMult: 0.65, audienceMod: -15, desc: 'Oversaturated — audiences are burnt out.' },
};
const AUDIENCE_FATIGUE_THRESHOLD = 4;

// ==================== TALENT RELATIONSHIP SYSTEM (SYSTEM 2) ====================
const TALENT_MOODS = ['Motivated', 'Content', 'Frustrated', 'Demanding', 'Loyal', 'Difficult'];
const TALENT_PERKS = [
  { id: 'trailer', name: 'Private Trailer', cost: 50000, moodBoost: 5, desc: 'Luxury on-set trailer' },
  { id: 'profit_share', name: 'Profit Participation', cost: 0, profitSharePct: 5, moodBoost: 10, desc: '5% of net profits' },
  { id: 'creative_input', name: 'Creative Input', cost: 0, qualityMod: 3, moodBoost: 8, desc: 'Let them contribute creatively' },
  { id: 'personal_chef', name: 'Personal Chef', cost: 30000, moodBoost: 4, desc: 'Catering to their tastes' },
  { id: 'first_class', name: 'First-Class Travel', cost: 80000, moodBoost: 6, desc: 'Private jets and suites' },
  { id: 'entourage', name: 'Entourage Allowance', cost: 40000, moodBoost: 3, desc: 'Bring the whole crew' },
];

const calcTalentMood = (talent) => {
  const base = 50;
  let mood = base;
  mood += (talent.loyalty || 0) * 0.5;
  mood -= (talent.consecutiveFilms || 0) * 8;
  mood += (talent.lastFilmQuality || 50) > 70 ? 10 : -5;
  mood += (talent.perks || []).length * 5;
  const marketVal = talent.marketValue || talent.salary;
  if (talent.salary > marketVal) mood += 10;
  if (talent.salary < marketVal * 0.8) mood -= 15;
  return Math.round(Math.max(0, Math.min(100, mood)));
};

const getTalentMoodLabel = (moodScore) => {
  if (moodScore >= 80) return 'Loyal';
  if (moodScore >= 65) return 'Motivated';
  if (moodScore >= 50) return 'Content';
  if (moodScore >= 35) return 'Frustrated';
  if (moodScore >= 20) return 'Demanding';
  return 'Difficult';
};

const calcSalaryDemand = (talent) => {
  let base = talent.salary || 500000;
  if (talent.awards && talent.awards > 0) base *= 1 + talent.awards * 0.15;
  if (talent.consecutiveHits && talent.consecutiveHits >= 2) base *= 1.3;
  if (talent.lastFilmQuality && talent.lastFilmQuality < 40) base *= 0.8;
  const phase = CAREER_PHASES.find(p => talent.age >= p.minAge && talent.age <= p.maxAge);
  if (phase) base *= phase.salaryMod;
  return Math.round(base);
};

// ==================== AWARDS CAMPAIGN SYSTEM (SYSTEM 3) ====================
const AWARD_CATEGORIES = [
  { id: 'bestPicture', name: 'Best Picture', weight: 1.0, qualityMin: 65 },
  { id: 'bestDirector', name: 'Best Director', weight: 0.8, qualityMin: 70 },
  { id: 'bestActor', name: 'Best Actor', weight: 0.7, qualityMin: 60 },
  { id: 'bestScreenplay', name: 'Best Screenplay', weight: 0.7, qualityMin: 65 },
  { id: 'bestScore', name: 'Best Original Score', weight: 0.4, qualityMin: 55 },
  { id: 'bestVFX', name: 'Best Visual Effects', weight: 0.5, qualityMin: 50 },
  { id: 'bestCinematography', name: 'Best Cinematography', weight: 0.5, qualityMin: 60 },
  { id: 'bestAnimated', name: 'Best Animated Film', weight: 0.6, qualityMin: 55 },
];

const CAMPAIGN_STRATEGIES = [
  { id: 'grassroots', name: 'Grassroots Campaign', costMult: 0.5, effectMult: 0.6, desc: 'Word-of-mouth and film society screenings' },
  { id: 'standard', name: 'Standard Campaign', costMult: 1.0, effectMult: 1.0, desc: 'Trade ads, screeners, and FYC events' },
  { id: 'aggressive', name: 'Aggressive Campaign', costMult: 2.0, effectMult: 1.5, desc: 'Full media blitz, billboards, and private screenings' },
  { id: 'prestige', name: 'Prestige Push', costMult: 3.0, effectMult: 1.8, desc: 'No expense spared — the full Oscar playbook' },
];

// ==================== FILM CATALOG & LEGACY VALUE (SYSTEM 4) ====================
const CATALOG_REVENUE_STREAMS = [
  { id: 'tv_licensing', name: 'TV Licensing', yearsAfterRelease: 2, annualRevPct: 0.02, desc: 'Broadcast rights to networks' },
  { id: 'home_video', name: 'Home Video/Digital', yearsAfterRelease: 1, annualRevPct: 0.05, desc: 'Physical and digital sales' },
  { id: 'streaming_license', name: 'Streaming License', yearsAfterRelease: 3, annualRevPct: 0.08, desc: 'Licensed to streaming platforms' },
  { id: 'airline', name: 'In-Flight Entertainment', yearsAfterRelease: 1, annualRevPct: 0.005, desc: 'Airline and hotel VOD' },
  { id: 'educational', name: 'Educational License', yearsAfterRelease: 5, annualRevPct: 0.003, desc: 'Film schools and libraries' },
];
const CULT_CLASSIC_THRESHOLD = 15;
const CULT_CLASSIC_QUALITY_MIN = 45;
const CULT_CLASSIC_QUALITY_MAX = 70;

const calcCatalogValue = (film, currentYear) => {
  if (!film.releaseYear || film.status !== 'released') return 0;
  const age = currentYear - film.releaseYear;
  if (age < 1) return 0;
  let annualRev = 0;
  CATALOG_REVENUE_STREAMS.forEach(stream => {
    if (age >= stream.yearsAfterRelease) {
      const decay = Math.max(0.1, 1 - (age - stream.yearsAfterRelease) * 0.08);
      annualRev += film.gross * stream.annualRevPct * decay;
    }
  });
  if (age >= CULT_CLASSIC_THRESHOLD && film.quality >= CULT_CLASSIC_QUALITY_MIN && film.quality <= CULT_CLASSIC_QUALITY_MAX) {
    annualRev *= 2.5;
    film._isCultClassic = true;
  }
  if (film.quality >= 90) annualRev *= 1.5;
  return Math.round(annualRev / 12);
};

// ==================== CINEMATIC UNIVERSE SYSTEM (SYSTEM 5) ====================
const UNIVERSE_TIERS = [
  { id: 'shared', name: 'Shared Universe', minFilms: 3, crossoverBonus: 0.15, brandValue: 5, desc: 'Connected stories in a shared world' },
  { id: 'expanded', name: 'Expanded Universe', minFilms: 6, crossoverBonus: 0.25, brandValue: 15, desc: 'A rich tapestry of interconnected tales' },
  { id: 'mega', name: 'Mega-Universe', minFilms: 10, crossoverBonus: 0.35, brandValue: 30, desc: 'A cultural phenomenon spanning genres' },
];

const CROSSOVER_TYPES = [
  { id: 'cameo', name: 'Character Cameo', costMult: 1.05, grossBonus: 0.08, desc: 'A familiar face appears briefly' },
  { id: 'crossover', name: 'Full Crossover', costMult: 1.3, grossBonus: 0.25, desc: 'Characters from multiple franchises unite' },
  { id: 'event', name: 'Universe Event Film', costMult: 1.6, grossBonus: 0.45, desc: 'The culmination — everyone shows up' },
];

// ==================== RELEASE STRATEGY (SYSTEM 6) ====================
const RELEASE_STRATEGIES = [
  { id: 'wide_theatrical', name: 'Wide Theatrical', screensMult: 1.0, grossMult: 1.0, streamRevMult: 0, prestigeMod: 0, desc: 'Traditional wide release in theaters' },
  { id: 'limited_theatrical', name: 'Limited Release', screensMult: 0.3, grossMult: 0.5, streamRevMult: 0, prestigeMod: 8, desc: 'Artsy limited run — great for prestige' },
  { id: 'platform_release', name: 'Platform Release', screensMult: 0.1, grossMult: 0.3, streamRevMult: 0, prestigeMod: 12, desc: 'Ultra-exclusive — builds word of mouth before expanding' },
  { id: 'day_and_date', name: 'Day-and-Date', screensMult: 0.7, grossMult: 0.7, streamRevMult: 0.8, prestigeMod: -5, desc: 'Simultaneous theater + streaming' },
  { id: 'streaming_exclusive', name: 'Streaming Exclusive', screensMult: 0, grossMult: 0, streamRevMult: 1.5, prestigeMod: -8, desc: 'Skip theaters entirely — streaming only' },
  { id: 'streaming_premiere', name: 'Streaming Premiere + Late Theatrical', screensMult: 0.4, grossMult: 0.35, streamRevMult: 1.2, prestigeMod: -3, desc: 'Stream first, then limited theatrical' },
];

// ==================== STUDIO FACILITIES (SYSTEM 7 - Enhanced) ====================
const STUDIO_FACILITIES = [
  { id: 'soundstage_basic', name: 'Basic Soundstage', cost: 5000000, monthlyUpkeep: 50000, capacity: 1, qualityBonus: 2, desc: 'A standard indoor filming stage' },
  { id: 'soundstage_large', name: 'Large Soundstage', cost: 15000000, monthlyUpkeep: 120000, capacity: 2, qualityBonus: 5, desc: 'Massive stage for big productions' },
  { id: 'backlot', name: 'Backlot', cost: 8000000, monthlyUpkeep: 80000, capacity: 1, qualityBonus: 3, genreBonus: ['Western', 'War', 'Action'], desc: 'Outdoor sets and cityscapes' },
  { id: 'water_stage', name: 'Water Stage', cost: 20000000, monthlyUpkeep: 150000, capacity: 1, qualityBonus: 6, genreBonus: ['Action', 'Fantasy', 'Sci-Fi'], desc: 'Massive tank for water sequences' },
  { id: 'vfx_lab', name: 'VFX Lab', cost: 12000000, monthlyUpkeep: 100000, capacity: 0, qualityBonus: 4, genreBonus: ['Sci-Fi', 'Fantasy', 'Animation', 'Action'], desc: 'In-house visual effects department' },
  { id: 'recording_studio', name: 'Recording Studio', cost: 6000000, monthlyUpkeep: 40000, capacity: 0, qualityBonus: 2, genreBonus: ['Musical', 'Animation', 'Drama'], desc: 'Score and soundtrack production' },
  { id: 'editing_suite', name: 'Premium Editing Suite', cost: 4000000, monthlyUpkeep: 30000, capacity: 0, qualityBonus: 3, desc: 'State-of-the-art post-production' },
  { id: 'screening_room', name: 'Private Screening Room', cost: 3000000, monthlyUpkeep: 20000, capacity: 0, qualityBonus: 1, desc: 'Test screenings and executive reviews' },
];

const getStudioCapacity = (facilities) => facilities.reduce((sum, f) => {
  const def = STUDIO_FACILITIES.find(sf => sf.id === f.facilityId);
  return sum + (def ? def.capacity : 0);
}, 0);

const getStudioQualityBonus = (facilities, genre) => facilities.reduce((sum, f) => {
  const def = STUDIO_FACILITIES.find(sf => sf.id === f.facilityId);
  if (!def) return sum;
  let bonus = def.qualityBonus;
  if (def.genreBonus && def.genreBonus.includes(genre)) bonus += 3;
  return sum + bonus;
}, 0);

// ==================== ZEITGEIST EVENTS (SYSTEM 8) ====================
const ZEITGEIST_EVENTS = [
  { id: 'economic_boom', name: 'Economic Boom', duration: [12, 36], grossMult: 1.25, budgetInflation: 1.1, genreBoost: { Comedy: 0.1, Action: 0.15, Musical: 0.1 }, desc: 'Audiences spending freely' },
  { id: 'recession', name: 'Recession', duration: [12, 24], grossMult: 0.75, budgetInflation: 0.9, genreBoost: { Drama: 0.15, Comedy: 0.1, Documentary: 0.1 }, desc: 'Escapism and cheaper thrills' },
  { id: 'tech_revolution', name: 'Tech Revolution', duration: [24, 48], grossMult: 1.1, budgetInflation: 1.0, genreBoost: { 'Sci-Fi': 0.25, Thriller: 0.1, Documentary: 0.1 }, desc: 'New tech captivates imaginations' },
  { id: 'war_abroad', name: 'Major Conflict Abroad', duration: [12, 48], grossMult: 0.9, budgetInflation: 1.05, genreBoost: { War: 0.3, Thriller: 0.15, Drama: 0.1 }, desc: 'Audiences crave meaning and heroism' },
  { id: 'social_movement', name: 'Social Justice Movement', duration: [12, 36], grossMult: 1.05, budgetInflation: 1.0, genreBoost: { Drama: 0.2, Documentary: 0.25, Comedy: -0.1 }, desc: 'Stories of change resonate deeply' },
  { id: 'pandemic', name: 'Global Pandemic', duration: [6, 18], grossMult: 0.4, budgetInflation: 1.2, genreBoost: { Horror: 0.2, 'Sci-Fi': 0.15, Drama: 0.1, Animation: 0.15 }, desc: 'Theaters suffer — streaming surges' },
  { id: 'space_race', name: 'Space Exploration Milestone', duration: [6, 24], grossMult: 1.1, budgetInflation: 1.0, genreBoost: { 'Sci-Fi': 0.3, Documentary: 0.2, Action: 0.1 }, desc: 'The cosmos capture public imagination' },
  { id: 'nostalgia_wave', name: 'Nostalgia Wave', duration: [12, 36], grossMult: 1.15, budgetInflation: 1.0, genreBoost: { Musical: 0.2, Comedy: 0.15, Romance: 0.15, Western: 0.1 }, desc: 'Audiences crave the familiar' },
  { id: 'true_crime_craze', name: 'True Crime Craze', duration: [12, 24], grossMult: 1.1, budgetInflation: 1.0, genreBoost: { Mystery: 0.25, Thriller: 0.2, Documentary: 0.15 }, desc: 'The public is obsessed with real cases' },
  { id: 'superhero_fatigue', name: 'Superhero Fatigue', duration: [12, 36], grossMult: 0.95, budgetInflation: 1.0, genreBoost: { Action: -0.2, 'Sci-Fi': -0.1, Drama: 0.1, Horror: 0.1 }, desc: 'Audiences tired of capes and tights' },
  { id: 'ai_anxiety', name: 'AI Anxiety', duration: [12, 48], grossMult: 1.05, budgetInflation: 1.0, genreBoost: { 'Sci-Fi': 0.25, Thriller: 0.15, Horror: 0.1, Documentary: 0.15 }, desc: 'Fear and fascination with artificial intelligence' },
  { id: 'streaming_wars', name: 'Streaming Wars', duration: [12, 36], grossMult: 0.85, budgetInflation: 1.15, genreBoost: {}, desc: 'Theatrical suffers as platforms spend billions on content' },
];

// ==================== DISTRIBUTION DEALS ENHANCED (SYSTEM 9) ====================
const DISTRIBUTION_TIERS = [
  { id: 'self', name: 'Self-Distribution', feePct: 0, screenAccess: 0.2, marketingSupport: 0, prestigeMod: -5, desc: 'You handle everything — cheap but limited reach' },
  { id: 'indie', name: 'Indie Distributor', feePct: 0.15, screenAccess: 0.5, marketingSupport: 0.5, prestigeMod: 3, desc: 'Boutique distribution for art films' },
  { id: 'mid', name: 'Mid-Tier Studio Deal', feePct: 0.25, screenAccess: 0.75, marketingSupport: 1.0, prestigeMod: 0, desc: 'Solid distribution with decent reach' },
  { id: 'major', name: 'Major Studio Distribution', feePct: 0.35, screenAccess: 1.0, marketingSupport: 1.5, prestigeMod: 5, desc: 'Maximum screens and marketing muscle' },
  { id: 'global', name: 'Global Distribution Network', feePct: 0.40, screenAccess: 1.0, marketingSupport: 2.0, prestigeMod: 8, intlGrossBonus: 0.3, desc: 'Worldwide reach with international marketing' },
];

const THEATER_NEGOTIATIONS = [
  { id: 'standard', name: 'Standard Terms', studioSharePct: 55, screens: 'normal', desc: '55/45 split — industry standard' },
  { id: 'aggressive', name: 'Aggressive Terms', studioSharePct: 65, screens: 'reduced', desc: '65/35 in your favor — fewer theaters will agree' },
  { id: 'generous', name: 'Generous Terms', studioSharePct: 45, screens: 'expanded', desc: '45/55 — theaters love you, max screen count' },
  { id: 'four_wall', name: 'Four-Walling', studioSharePct: 90, screens: 'minimal', cost: 500000, desc: 'Rent the theaters yourself — huge risk, huge reward' },
];

// ==================== FILM FESTIVALS ====================
const FILM_FESTIVALS = [
  { id: 'cannes', name: 'Cannes Film Festival', prestigeBonus: 12, reputationBonus: 5, grossBonus: 0.15, minQuality: 70, preferredGenres: ['Drama', 'Thriller', 'Romance'] },
  { id: 'sundance', name: 'Sundance Film Festival', prestigeBonus: 8, reputationBonus: 8, grossBonus: 0.10, minQuality: 60, preferredGenres: ['Drama', 'Documentary', 'Horror', 'Comedy'] },
  { id: 'venice', name: 'Venice Film Festival', prestigeBonus: 10, reputationBonus: 4, grossBonus: 0.12, minQuality: 75, preferredGenres: ['Drama', 'Fantasy', 'Mystery'] },
  { id: 'tiff', name: 'Toronto Intl Film Festival', prestigeBonus: 7, reputationBonus: 6, grossBonus: 0.08, minQuality: 55, preferredGenres: ['Drama', 'Comedy', 'Documentary'] },
  { id: 'berlin', name: 'Berlin Film Festival', prestigeBonus: 9, reputationBonus: 5, grossBonus: 0.10, minQuality: 65, preferredGenres: ['Drama', 'Documentary', 'Thriller'] },
  { id: 'tribeca', name: 'Tribeca Film Festival', prestigeBonus: 5, reputationBonus: 7, grossBonus: 0.06, minQuality: 50, preferredGenres: ['Documentary', 'Drama', 'Comedy', 'Sci-Fi'] },
];

// ==================== TV/SERIES DIVISION ====================
const TV_GENRES = ['Drama Series', 'Comedy Series', 'Sci-Fi Series', 'Thriller Series', 'Documentary Series', 'Animation Series', 'Reality Show'];

const TV_FORMATS = [
  { id: 'drama', name: 'Drama Series', episodesRange: [8, 13], baseCostPerEp: 3e6, qualityWeight: 0.9, audienceBase: 1.0 },
  { id: 'comedy', name: 'Comedy Series', episodesRange: [10, 22], baseCostPerEp: 1.5e6, qualityWeight: 0.7, audienceBase: 1.2 },
  { id: 'scifi', name: 'Sci-Fi Series', episodesRange: [8, 10], baseCostPerEp: 5e6, qualityWeight: 0.85, audienceBase: 0.8 },
  { id: 'thriller', name: 'Thriller Series', episodesRange: [8, 10], baseCostPerEp: 3.5e6, qualityWeight: 0.85, audienceBase: 0.9 },
  { id: 'docuseries', name: 'Documentary Series', episodesRange: [6, 8], baseCostPerEp: 1e6, qualityWeight: 0.8, audienceBase: 0.6 },
  { id: 'animation', name: 'Animation Series', episodesRange: [10, 13], baseCostPerEp: 2e6, qualityWeight: 0.75, audienceBase: 1.1 },
  { id: 'reality', name: 'Reality Show', episodesRange: [10, 16], baseCostPerEp: 500000, qualityWeight: 0.4, audienceBase: 1.5 },
  { id: 'limited', name: 'Limited Series', episodesRange: [6, 8], baseCostPerEp: 4e6, qualityWeight: 0.95, audienceBase: 0.7, maxSeasons: 1 },
];

const STREAMING_TIERS = [
  { id: 'basic', name: 'Ad-Supported', monthlyPrice: 5.99, adRevPerSub: 3, churnRate: 0.08, desc: 'Free with ads — high volume, high churn' },
  { id: 'standard', name: 'Standard', monthlyPrice: 12.99, adRevPerSub: 0, churnRate: 0.04, desc: 'No ads — the sweet spot' },
  { id: 'premium', name: 'Premium', monthlyPrice: 19.99, adRevPerSub: 0, churnRate: 0.03, desc: '4K, downloads, exclusive early access' },
];

const RIVAL_STREAMERS = [
  { name: 'RedStream', tier: 'major', baseSubscribers: 100e6, contentBudget: 800e6, founded: 2007, desc: 'The pioneer — started with DVDs, conquered streaming.' },
  { name: 'GreenClip', tier: 'mid', baseSubscribers: 30e6, contentBudget: 200e6, founded: 2008, desc: 'Ad-supported upstart backed by broadcast networks.' },
  { name: 'Titan Video', tier: 'major', baseSubscribers: 80e6, contentBudget: 700e6, founded: 2011, desc: 'Tech giant with unlimited cash and fast shipping perks.' },
  { name: 'CastleVision+', tier: 'major', baseSubscribers: 60e6, contentBudget: 600e6, founded: 2019, desc: 'Family entertainment empire goes direct-to-consumer.' },
  { name: 'MaxScreen', tier: 'major', baseSubscribers: 40e6, contentBudget: 500e6, founded: 2020, desc: 'Premium prestige content from a legendary studio.' },
  { name: 'Orchard TV+', tier: 'mid', baseSubscribers: 25e6, contentBudget: 400e6, founded: 2019, desc: 'Tech company betting big on original prestige content.' },
  { name: 'Plume', tier: 'mid', baseSubscribers: 15e6, contentBudget: 150e6, founded: 2020, desc: 'Broadcast network reinvents itself for the streaming age.' },
  { name: 'Summit+', tier: 'mid', baseSubscribers: 20e6, contentBudget: 200e6, founded: 2021, desc: 'Classic studio catalog meets modern streaming.' },
];

const CONTENT_DISTRIBUTION_OPTIONS = [
  { id: 'theatrical', name: 'Theatrical Release', desc: 'Traditional wide release in cinemas', filmOnly: true },
  { id: 'streaming_exclusive', name: 'Streaming Exclusive', desc: 'Skip theaters, release directly on your platform', requiresStreaming: true },
  { id: 'hybrid', name: 'Hybrid Release', desc: 'Theaters first, then streaming after window', requiresStreaming: true },
  { id: 'day_and_date', name: 'Day-and-Date', desc: 'Simultaneous theater + streaming', requiresStreaming: true },
];

const WINDOWING_OPTIONS = [
  { id: 'exclusive_90', name: '90-Day Exclusive', theatricalBonus: 1.0, streamingDelay: 3, desc: 'Full theatrical run before streaming' },
  { id: 'exclusive_45', name: '45-Day Window', theatricalBonus: 0.85, streamingDelay: 1.5, desc: 'Shortened window, faster to streaming' },
  { id: 'simultaneous', name: 'Same Day', theatricalBonus: 0.5, streamingDelay: 0, desc: 'Both at once — cannibalizes box office but boosts subs' },
];

// ==================== THEME PARKS ====================
const THEME_PARK_TIERS = [
  { name: 'Small Theme Park', cost: 50000000, monthlyRevenue: 700000, prestigeBonus: 5, minFranchises: 1, buildMonths: 12 },
  { name: 'Major Theme Park', cost: 200000000, monthlyRevenue: 2700000, prestigeBonus: 15, minFranchises: 3, buildMonths: 24 },
  { name: 'Theme Park Resort', cost: 500000000, monthlyRevenue: 8300000, prestigeBonus: 30, minFranchises: 5, buildMonths: 36 },
  { name: 'Global Theme Park Empire', cost: 2000000000, monthlyRevenue: 27000000, prestigeBonus: 50, minFranchises: 8, buildMonths: 60 },
];

// ==================== IPO & STOCK MARKET ====================
const IPO_REQUIREMENTS = { minCash: 100000000, minReputation: 60, minPrestige: 50, minFilms: 15, ipoCost: 10000000 };

// ==================== THEATER CHAINS ====================
const THEATER_CHAINS = [
  { name: 'Small Regional Chain', cost: 30000000, screenBonus: 0.05, ticketCut: 0.03, capacity: 200 },
  { name: 'National Chain', cost: 150000000, screenBonus: 0.12, ticketCut: 0.06, capacity: 1000 },
  { name: 'Mega Multiplex Empire', cost: 500000000, screenBonus: 0.20, ticketCut: 0.10, capacity: 3000 },
];

// ==================== MERCHANDISE ====================
const calcMerchandiseRevenue = (franchises, films) => {
  let total = 0;
  franchises.forEach(f => {
    const franchiseFilms = films.filter(m => m.franchiseId === f.id && m.status === 'released');
    const avgGross = franchiseFilms.length > 0 ? franchiseFilms.reduce((s, m) => s + m.totalGross, 0) / franchiseFilms.length : 0;
    const popularity = Math.min(franchiseFilms.length * 0.15, 1.0); // scales with # of films, caps at 1.0
    total += avgGross * 0.01 * popularity; // 1% of avg gross * popularity factor per month
  });
  return Math.round(total);
};

// ==================== LICENSING WINDOWS ====================
// Time decay: revenue drops 3% per year after release as content ages
const LICENSING_WINDOWS = [
  { id: 'homeVideo', name: 'Home Video / VOD', monthsAfterRelease: 4, revenuePct: 0.04, duration: 12, desc: 'Physical & digital sales' },
  { id: 'streaming', name: 'Streaming Rights', monthsAfterRelease: 12, revenuePct: 0.03, duration: 24, desc: 'Platform licensing deals' },
  { id: 'tvSyndication', name: 'TV Syndication', monthsAfterRelease: 24, revenuePct: 0.02, duration: 36, desc: 'Network & cable reruns' },
  { id: 'library', name: 'Library Licensing', monthsAfterRelease: 48, revenuePct: 0.008, duration: 999, desc: 'Perpetual catalog value' },
];

// ==================== INVESTOR TYPES ====================
const INVESTOR_TYPES = [
  { id: 'angel', name: 'Angel Investor', fundPct: 0.30, revSharePct: 0.40, minBudget: 5e6, maxBudget: 30e6, desc: 'Funds 30%, takes 40% of profit' },
  { id: 'equity', name: 'Equity Partner', fundPct: 0.50, revSharePct: 0.55, minBudget: 20e6, maxBudget: 100e6, desc: 'Funds 50%, takes 55% of profit' },
  { id: 'slate', name: 'Slate Financier', fundPct: 0.60, revSharePct: 0.65, minBudget: 50e6, maxBudget: 500e6, desc: 'Funds 60%, takes 65% of profit' },
];

// ==================== TAX STRATEGY ====================
const TAX_RATE = 0.25; // 25% corporate tax
const TAX_DEDUCTIONS = [
  { id: 'reinvestment', name: 'Reinvestment Deduction', desc: 'Deduct facility & tech spending', rate: 0.10 },
  { id: 'charitable', name: 'Charitable Giving', desc: 'Donate to reduce taxes', rate: 0.05, cost: 0.03 },
  { id: 'accounting', name: 'Creative Accounting', desc: 'Aggressive tax planning', rate: 0.08, riskPct: 0.15 },
];

// ==================== INTERNATIONAL BOX OFFICE ====================
const INTL_REGIONS = [
  { id: 'europe', name: 'Europe', share: 0.35, genreBonus: { Drama: 0.15, Thriller: 0.10, Comedy: -0.10 } },
  { id: 'asia', name: 'Asia Pacific', share: 0.30, genreBonus: { Action: 0.15, Animation: 0.20, Horror: 0.10, Western: -0.20 } },
  { id: 'latam', name: 'Latin America', share: 0.15, genreBonus: { Romance: 0.15, Action: 0.10, Documentary: -0.15 } },
  { id: 'middleEast', name: 'Middle East & Africa', share: 0.10, genreBonus: { Action: 0.10, Drama: 0.05, Horror: -0.10 } },
  { id: 'other', name: 'Rest of World', share: 0.10, genreBonus: {} },
];

// ==================== PRESS/MEDIA SYSTEM ====================
const PRESS_EVENTS = [
  { id: 'tabloidScandal', name: 'Tabloid Scandal', desc: 'Negative press about a cast member', repChange: -8, buzzChange: 5, prestigeChange: -3 },
  { id: 'magazineCover', name: 'Magazine Cover Feature', desc: 'Film featured on major magazine', repChange: 5, buzzChange: 8, prestigeChange: 5 },
  { id: 'talkShow', name: 'Talk Show Appearance', desc: 'Lead actor on late-night TV', repChange: 3, buzzChange: 6, prestigeChange: 2 },
  { id: 'premiereInterview', name: 'Premiere Red Carpet Interview', desc: 'Major media coverage at premiere', repChange: 4, buzzChange: 7, prestigeChange: 3 },
  { id: 'awardsShowMoment', name: 'Awards Show Moment', desc: 'Memorable speech or performance', repChange: 6, buzzChange: 5, prestigeChange: 8 },
  { id: 'controversialStatement', name: 'Controversial Statement', desc: 'Actor makes provocative comments', repChange: -5, buzzChange: 10, prestigeChange: -2 },
];

const PRESS_RESPONSES = [
  { id: 'ignore', name: 'Ignore', desc: 'Say nothing, let it blow over' },
  { id: 'deny', name: 'Deny & Refute', desc: 'Issue strong denial (risky if false)' },
  { id: 'leanIn', name: 'Lean Into It', desc: 'Embrace the controversy for attention' },
  { id: 'apologize', name: 'Apologize & Clarify', desc: 'Take responsibility and move forward' },
];

// ==================== FILM SCHOOL PIPELINE ====================
const FILM_SCHOOLS = [
  { id: 'community', name: 'Community Film Program', cost: 500000, tier: 'community', monthlyUpkeep: 50000, graduateInterval: 9, talentQualityRange: [40, 65], salaryMult: 0.5, desc: 'Local community college. Cheap but uneven quality.' },
  { id: 'state', name: 'State Film School', cost: 2000000, tier: 'state', monthlyUpkeep: 150000, graduateInterval: 8, talentQualityRange: [55, 75], salaryMult: 0.65, desc: 'Respected state university. Reliable talent pipeline.' },
  { id: 'elite', name: 'Elite Academy', cost: 5000000, tier: 'elite', monthlyUpkeep: 300000, graduateInterval: 6, talentQualityRange: [70, 90], salaryMult: 0.75, desc: 'Ivy-league quality. Best talent but expensive.' },
];

// ==================== INTERNATIONAL STUDIO PARTNERSHIPS ====================
const INTERNATIONAL_PARTNERS = [
  { id: 'bollywood', name: 'Bollywood', region: 'India', genres: ['Drama', 'Romance', 'Musical', 'Action'], monthlyFee: 200000, boxOfficeBonus: { India: 0.30, 'Asia Pacific': 0.15 }, talentSalaryBonus: -0.20, desc: 'Access to world\'s largest film industry' },
  { id: 'koreanCinema', name: 'Korean Cinema', region: 'South Korea', genres: ['Thriller', 'Horror', 'Action', 'Drama'], monthlyFee: 250000, boxOfficeBonus: { 'Asia Pacific': 0.25, Europe: 0.10 }, talentSalaryBonus: -0.15, desc: 'Cutting-edge genre filmmaking' },
  { id: 'europeanArtHouse', name: 'European Art House', region: 'Europe', genres: ['Drama', 'Documentary', 'Thriller', 'Mystery'], monthlyFee: 300000, boxOfficeBonus: { Europe: 0.35, 'Rest of World': 0.10 }, talentSalaryBonus: -0.10, desc: 'Prestige and festival favor' },
  { id: 'japaneseAnimation', name: 'Japanese Animation Studios', region: 'Japan', genres: ['Animation', 'Sci-Fi', 'Fantasy'], monthlyFee: 150000, boxOfficeBonus: { 'Asia Pacific': 0.40, 'Rest of World': 0.15 }, talentSalaryBonus: 0, desc: 'Animation excellence and anime fans' },
  { id: 'nollywood', name: 'Nollywood', region: 'Nigeria', genres: ['Drama', 'Action', 'Comedy', 'Horror'], monthlyFee: 100000, boxOfficeBonus: { 'Middle East & Africa': 0.40, 'Rest of World': 0.08 }, talentSalaryBonus: -0.25, desc: 'Emerging market expertise' },
  { id: 'latinAmerican', name: 'Latin American Cinema', region: 'Mexico/Brazil', genres: ['Drama', 'Romance', 'Thriller', 'Action'], monthlyFee: 180000, boxOfficeBonus: { 'Latin America': 0.35, 'Rest of World': 0.10 }, talentSalaryBonus: -0.18, desc: 'Growing powerhouse region' },
];

// ==================== CREDIT RATINGS ====================
const CREDIT_RATINGS = [
  { id: 'AAA', name: 'AAA', minScore: 90, interestMod: 0.7, maxLoans: 5, desc: 'Prime borrower' },
  { id: 'AA', name: 'AA', minScore: 75, interestMod: 0.85, maxLoans: 4, desc: 'High grade' },
  { id: 'A', name: 'A', minScore: 60, interestMod: 1.0, maxLoans: 3, desc: 'Upper medium' },
  { id: 'BBB', name: 'BBB', minScore: 40, interestMod: 1.15, maxLoans: 3, desc: 'Lower medium' },
  { id: 'BB', name: 'BB', minScore: 20, interestMod: 1.4, maxLoans: 2, desc: 'Speculative' },
  { id: 'B', name: 'B', minScore: 0, interestMod: 1.8, maxLoans: 1, desc: 'Highly speculative' },
];

const calcCreditScore = (state) => {
  let score = 50; // baseline
  if (state.cash > 50e6) score += 15; else if (state.cash > 10e6) score += 8; else if (state.cash < 0) score -= 20;
  if (state.reputation > 60) score += 10; else if (state.reputation < 30) score -= 10;
  if (state.loans.length === 0) score += 10;
  if (state.loans.length >= 3) score -= 15;
  if (state.totalFilmsReleased > 20) score += 10;
  const profitableFilms = state.films.filter(f => f.status === 'released' && f.profit > 0).length;
  const totalReleased = state.films.filter(f => f.status === 'released').length;
  if (totalReleased > 0) score += Math.round((profitableFilms / totalReleased) * 20);
  if (state.isPublic) score += 5;
  return clamp(score, 0, 100);
};

const getCreditRating = (state) => {
  const score = calcCreditScore(state);
  return CREDIT_RATINGS.find(r => score >= r.minScore) || CREDIT_RATINGS[CREDIT_RATINGS.length - 1];
};

// ==================== AI COMPETITION SYSTEMS ====================

// CEO Archetypes with deep behavior patterns
const CEO_ARCHETYPES = [
  { id: 'blockbuster_king', name: 'The Blockbuster King', strategy: 'tentpole', aggression: 0.7, riskTolerance: 0.8,
    genreWeights: { Action: 3, 'Sci-Fi': 2.5, Fantasy: 2, Animation: 1.5, Comedy: 1, Drama: 0.5 },
    budgetMult: 1.5, marketingMult: 1.6, franchiseFocus: 0.6, acquisitionRate: 0.05,
    desc: 'Goes big on tentpoles and franchises. High risk, high reward.' },
  { id: 'bean_counter', name: 'The Bean Counter', strategy: 'conservative', aggression: 0.25, riskTolerance: 0.2,
    genreWeights: { Comedy: 2, Horror: 2, Drama: 1.5, Thriller: 1.5, Documentary: 1, Romance: 1 },
    budgetMult: 0.6, marketingMult: 0.7, franchiseFocus: 0.1, acquisitionRate: 0.01,
    desc: 'Conservative, steady profits, rarely takes risks.' },
  { id: 'prestige_chaser', name: 'The Prestige Chaser', strategy: 'awards', aggression: 0.4, riskTolerance: 0.5,
    genreWeights: { Drama: 3, Documentary: 2, War: 1.5, Romance: 1, Mystery: 1 },
    budgetMult: 0.9, marketingMult: 0.5, franchiseFocus: 0.05, acquisitionRate: 0.03,
    desc: 'Burns money for awards. Critics over box office.' },
  { id: 'disruptor', name: 'The Disruptor', strategy: 'streaming', aggression: 0.6, riskTolerance: 0.7,
    genreWeights: { Thriller: 2, Horror: 2, 'Sci-Fi': 1.5, Comedy: 1.5, Drama: 1 },
    budgetMult: 0.8, marketingMult: 1.3, franchiseFocus: 0.3, acquisitionRate: 0.08,
    desc: 'Streaming-first. Buys IP aggressively, undercuts on pricing.' },
  { id: 'legacy_studio', name: 'The Legacy Studio', strategy: 'franchise', aggression: 0.35, riskTolerance: 0.3,
    genreWeights: { Animation: 2, Fantasy: 2, Action: 1.5, 'Sci-Fi': 1, Musical: 1 },
    budgetMult: 1.2, marketingMult: 1.1, franchiseFocus: 0.8, acquisitionRate: 0.02,
    desc: 'Franchise-dependent. Slow to adapt but massive catalog.' },
];

// Espionage/dirty tricks types
const ESPIONAGE_ACTIONS = [
  { id: 'twin_film', name: 'Twin Film', desc: 'A rival rushes a suspiciously similar film to market before yours.', playerGrossPenalty: 0.25, cost: 0, detectChance: 0.3 },
  { id: 'talent_tamper', name: 'Talent Tampering', desc: 'A rival whispers sweet nothings to your contracted talent.', relationshipPenalty: 15, cost: 0, detectChance: 0.4 },
  { id: 'leaked_script', name: 'Script Leak', desc: 'Your upcoming film\'s plot was leaked online.', openingWeekendPenalty: 0.2, cost: 0, detectChance: 0.5 },
  { id: 'negative_reviews', name: 'Planted Negative Reviews', desc: 'Suspicious wave of negative reviews appeared.', criticScorePenalty: 8, cost: 0, detectChance: 0.35 },
  { id: 'poach_crew', name: 'Key Crew Poached', desc: 'A rival hired away your key crew mid-production.', qualityPenalty: 10, delayMonths: 1, cost: 0, detectChance: 0.45 },
  { id: 'smear_campaign', name: 'Smear Campaign', desc: 'Negative press about your studio appeared during awards season.', awardsPenalty: 0.3, repPenalty: 5, cost: 0, detectChance: 0.4 },
];

// Player espionage actions (risky but rewarding)
const PLAYER_ESPIONAGE = [
  { id: 'spy_development', name: 'Spy on Development', cost: 2e6, successChance: 0.6, caughtChance: 0.2, repPenalty: 10, desc: 'Learn what rivals are developing. Helps counter-program.' },
  { id: 'poach_talent', name: 'Poach Rival Talent', cost: 5e6, successChance: 0.5, caughtChance: 0.25, repPenalty: 8, desc: 'Lure top talent from a rival studio.' },
  { id: 'plant_mole', name: 'Plant a Mole', cost: 3e6, successChance: 0.4, caughtChance: 0.15, repPenalty: 15, desc: 'Insider at a rival studio. Early warning on releases.' },
  { id: 'sabotage_marketing', name: 'Sabotage Marketing', cost: 4e6, successChance: 0.45, caughtChance: 0.3, repPenalty: 12, desc: 'Undermine a rival\'s film marketing campaign.' },
  { id: 'counter_intel', name: 'Counter-Intelligence', cost: 8e6, successChance: 0.8, caughtChance: 0, repPenalty: 0, desc: 'Protect your studio from espionage. Reduces rival spy success by 50%.' },
];

// Industry coalition types
const INDUSTRY_COALITIONS = [
  { id: 'theatrical_alliance', name: 'Theatrical Alliance', desc: 'Push for longer theatrical windows. Hurts streaming, boosts box office.', effect: { theatricalGrossMult: 1.15, streamingRevMult: 0.85 }, opposedBy: 'streaming' },
  { id: 'streaming_coalition', name: 'Streaming Coalition', desc: 'Push for shorter windows. Boosts streaming, hurts theatrical.', effect: { theatricalGrossMult: 0.85, streamingRevMult: 1.2 }, opposedBy: 'theatrical' },
  { id: 'talent_guild', name: 'Talent Guild Alliance', desc: 'Support union demands. Higher costs but better talent access.', effect: { talentCostMult: 1.15, qualityMod: 3, laborBonus: true } },
  { id: 'tech_consortium', name: 'Tech Consortium', desc: 'Invest in new filmmaking tech. Early access to innovations.', effect: { techDiscount: 0.2, qualityMod: 2 } },
  { id: 'indie_collective', name: 'Independent Film Collective', desc: 'Support indie filmmaking. Prestige boost, festival advantages.', effect: { prestigeBonus: 5, festivalBoost: 0.15 } },
];

// Lobby regulation types
const LOBBY_REGULATIONS = [
  { id: 'extend_windows', name: 'Extended Theatrical Windows', targetBiz: 'streaming', effect: { streamingDelay: 2, theatricalBonus: 0.1 }, desc: 'Forces 90-day theatrical exclusivity.' },
  { id: 'ai_content_tax', name: 'AI Content Tax', targetBiz: 'ai', effect: { aiCostPenalty: 0.25 }, desc: 'Tax on AI-generated content hits AI studios.' },
  { id: 'foreign_film_quota', name: 'Foreign Film Quota', targetBiz: 'international', effect: { domesticBonus: 0.1 }, desc: 'Limits foreign film market share.' },
  { id: 'antitrust_action', name: 'Antitrust Investigation', targetBiz: 'dominant', effect: { acquisitionBlock: true, repPenalty: 5 }, desc: 'Triggered when one studio gets too big.' },
];

// ==================== STUDIO LOT BUILDINGS ====================
const STUDIO_LOT_BUILDINGS = [
  { id: 'office', name: 'Studio Office', emoji: '🏢', desc: 'Where deals are made.', bonus: 'Base of operations', unlock: { type: 'start' }, passive: null, gridPos: [1, 1] },
  { id: 'soundstage1', name: 'Soundstage A', emoji: '🎬', desc: 'Your first filming stage.', bonus: '+1 quality', unlock: { type: 'start' }, passive: { qualityBonus: 1 }, gridPos: [2, 1] },
  { id: 'parking', name: 'Parking Structure', emoji: '🅿️', desc: 'Gotta park somewhere.', bonus: 'Unlocks lot expansion', unlock: { type: 'films', count: 3 }, passive: null, gridPos: [0, 0] },
  { id: 'commissary', name: 'Commissary', emoji: '🍽️', desc: 'Cast & crew dining.', bonus: '-5% production costs', unlock: { type: 'films', count: 5 }, passive: { costReduction: 0.05 }, gridPos: [0, 1] },
  { id: 'soundstage2', name: 'Soundstage B', emoji: '🎥', desc: 'Double your capacity.', bonus: '+2 quality', unlock: { type: 'revenue', amount: 50e6 }, passive: { qualityBonus: 2 }, gridPos: [3, 1] },
  { id: 'postprod', name: 'Post-Production', emoji: '🖥️', desc: 'Editing & color grading.', bonus: '+3 quality, faster post', unlock: { type: 'revenue', amount: 100e6 }, passive: { qualityBonus: 3 }, gridPos: [2, 2] },
  { id: 'vfxlab', name: 'VFX Laboratory', emoji: '✨', desc: 'In-house visual effects.', bonus: '-10% VFX costs, +4 Sci-Fi/Fantasy quality', unlock: { type: 'revenue', amount: 200e6 }, passive: { qualityBonus: 4, vfxDiscount: 0.10, genres: ['Sci-Fi', 'Fantasy', 'Action'] }, gridPos: [3, 2] },
  { id: 'screening', name: 'Screening Room', emoji: '🎞️', desc: 'Private test screenings.', bonus: '+2 quality (better feedback)', unlock: { type: 'films', count: 15 }, passive: { qualityBonus: 2 }, gridPos: [1, 2] },
  { id: 'backlot', name: 'Backlot Sets', emoji: '🏘️', desc: 'Outdoor sets & streets.', bonus: '+3 quality Drama/Western/War', unlock: { type: 'revenue', amount: 300e6 }, passive: { qualityBonus: 3, genres: ['Drama', 'Western', 'War'] }, gridPos: [0, 2] },
  { id: 'executive', name: 'Executive Tower', emoji: '🏛️', desc: 'Impressive headquarters.', bonus: '+5 reputation', unlock: { type: 'rep', amount: 60 }, passive: { repBonus: 5 }, gridPos: [1, 0] },
  { id: 'soundstage3', name: 'Mega Soundstage', emoji: '🎭', desc: 'The biggest stage in town.', bonus: '+5 quality', unlock: { type: 'revenue', amount: 500e6 }, passive: { qualityBonus: 5 }, gridPos: [2, 0] },
  { id: 'recording', name: 'Recording Studio', emoji: '🎵', desc: 'Score & soundtrack.', bonus: '+2 quality Musical/Animation', unlock: { type: 'awards', count: 5 }, passive: { qualityBonus: 2, genres: ['Musical', 'Animation'] }, gridPos: [3, 0] },
  { id: 'archive', name: 'Film Archive', emoji: '🗄️', desc: 'Preserving your legacy.', bonus: '+10% catalog revenue', unlock: { type: 'films', count: 30 }, passive: { catalogBonus: 0.10 }, gridPos: [0, 3] },
  { id: 'academy_bldg', name: 'Training Academy', emoji: '🎓', desc: 'Develop new talent.', bonus: '+10% talent growth', unlock: { type: 'awards', count: 10 }, passive: { talentGrowth: 0.10 }, gridPos: [1, 3] },
  { id: 'theme_gate', name: 'Theme Park Gate', emoji: '🎢', desc: 'The ultimate expansion.', bonus: 'Theme park revenue', unlock: { type: 'revenue', amount: 1e9 }, passive: { themeParkBonus: true }, gridPos: [2, 3] },
  { id: 'helipad', name: 'VIP Helipad', emoji: '🚁', desc: 'For the biggest stars.', bonus: '+5% talent negotiation', unlock: { type: 'acquisitions', count: 2 }, passive: { talentDiscount: 0.05 }, gridPos: [3, 3] },
];

const getUnlockedBuildings = (state) => {
  return STUDIO_LOT_BUILDINGS.filter(b => {
    const u = b.unlock;
    if (u.type === 'start') return true;
    if (u.type === 'films') return (state.totalFilmsReleased || 0) >= u.count;
    if (u.type === 'revenue') return (state.totalGross || 0) >= u.amount;
    if (u.type === 'rep') return (state.reputation || 0) >= u.amount;
    if (u.type === 'awards') return (state.totalAwards || 0) >= u.count;
    if (u.type === 'acquisitions') return (state.acquiredStudios || []).length >= u.count;
    return false;
  });
};

const getLotPassiveBonuses = (state) => {
  const unlocked = getUnlockedBuildings(state);
  let totalQuality = 0, costReduction = 0;
  const genreBonuses = {};
  unlocked.forEach(b => {
    if (!b.passive) return;
    totalQuality += b.passive.qualityBonus || 0;
    costReduction += b.passive.costReduction || 0;
    if (b.passive.genres) b.passive.genres.forEach(g => { genreBonuses[g] = (genreBonuses[g] || 0) + (b.passive.qualityBonus || 0); });
  });
  return { totalQuality, costReduction, genreBonuses };
};

// ==================== TALENT DIALOGUE SYSTEM ====================
const TALENT_DIALOGUE = {
  cast_excited: [
    "I've been waiting for a role like this my whole career.",
    "When I read the script, I couldn't put it down. I'm in.",
    "This is the kind of project that defines a legacy.",
    "Tell the director I'm ready to give everything.",
  ],
  cast_reluctant: [
    "The script isn't great, but the paycheck is.",
    "I have... reservations, but I trust the director.",
    "My agent says this is a good career move. We'll see.",
    "I've done worse. Let's make the best of it.",
  ],
  hit_proud: [
    "I knew this film was special from day one.",
    "The audience gets it. That's all that matters.",
    "When you work with talent like this, magic happens.",
    "I told my agent this would be the one.",
  ],
  hit_surprised: [
    "I honestly didn't expect it to do this well!",
    "Sometimes the stars just align. What a ride.",
    "My phone hasn't stopped ringing since opening weekend.",
  ],
  flop_deflect: [
    "Sometimes the audience just isn't ready.",
    "We made the film we wanted to make. I stand by it.",
    "Box office doesn't measure artistic merit.",
    "It'll find its audience eventually. Trust me.",
  ],
  flop_angry: [
    "I should have listened to my instincts on this one.",
    "Don't ask me about that project. Next question.",
    "Some films are learning experiences. Expensive ones.",
  ],
  nomination: [
    "Just being nominated is an incredible honor.",
    "I can't believe it. This is a dream come true.",
    "I better win this time. Third time's the charm.",
  ],
  award_win: [
    "I'd like to thank the academy... and everyone who believed.",
    "This belongs to the entire cast and crew.",
    "I promised myself I wouldn't cry. I lied.",
  ],
  negotiation: [
    "I know my worth. Let's talk numbers.",
    "My calendar is filling up fast. Make it worth my while.",
    "I'm sure we can work something out.",
  ],
};

const getTalentDialogue = (eventType, talent) => {
  let key = eventType;
  if (eventType === 'cast') key = talent && talent.skill >= 70 ? 'cast_excited' : 'cast_reluctant';
  else if (eventType === 'hit') key = talent && talent.skill >= 75 ? 'hit_proud' : 'hit_surprised';
  else if (eventType === 'flop') key = talent && talent.popularity >= 50 ? 'flop_deflect' : 'flop_angry';
  const quotes = TALENT_DIALOGUE[key];
  if (!quotes || quotes.length === 0) return null;
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// ==================== NEWSPAPER SYSTEM ====================
const NEWSPAPER_NAMES = [
  { era: 'classic', name: 'The Hollywood Chronicle', tagline: 'The Voice of the Motion Picture Industry Since 1920' },
  { era: 'modern', name: 'The Hollywood Chronicle', tagline: 'Entertainment Industry News & Analysis' },
  { era: 'digital', name: 'THE HOLLYWOOD CHRONICLE', tagline: 'Breaking Entertainment News' },
];

const NEWSPAPER_HEADLINES = {
  award_sweep: [
    { headline: '{studio} SWEEPS AWARDS SEASON', sub: '{film} takes home Best Picture as studio dominates ceremony', body: 'In a stunning display of filmmaking excellence, {studio} captured the hearts of voters with "{film}," winning {count} awards at the {show}. Industry analysts predict this marks the beginning of a golden era for the studio. "Nobody saw this coming," said veteran critic Leonard Marsh. "They\'ve redefined what it means to make a prestige picture."' },
    { headline: 'GOLD RUSH: {studio} CLAIMS TOP HONORS', sub: '{count} statuettes go home to {studio} in historic haul', body: 'The champagne flowed freely at {studio} last night as the studio claimed {count} awards at this year\'s {show}. "{film}" was the breakout star of the evening, cementing its place in cinema history. Sources close to the studio say celebrations lasted well past dawn.' },
    { headline: 'AND THE WINNER IS... {studio}!', sub: 'Studio walks away with {count} awards; "{film}" named Best Picture', body: 'In a night that will be remembered for years to come, {studio} dominated the {show}, taking home {count} of the evening\'s most coveted prizes. "{film}" earned the top honor of Best Picture, validating the studio\'s creative vision. "This is what happens when you trust the artists," the studio head declared backstage.' },
  ],
  box_office_100m: [
    { headline: '"{film}" CROSSES $100 MILLION MARK', sub: '{studio}\'s {genre} blockbuster shows no signs of slowing down', body: 'The box office juggernaut "{film}" has officially crossed the $100 million domestic mark, confirming {studio}\'s bet on the {genre} genre. Theater chains report sold-out showings across the country. "The audience appetite for this kind of storytelling is insatiable," said BoxOffice Pro analyst Janet Kim.' },
    { headline: 'HUNDRED MILLION DOLLAR BABY', sub: '{studio}\'s "{film}" joins the $100M club', body: '{studio} can breathe easy today as "{film}" sailed past the coveted $100 million milestone at the domestic box office. The {genre} film, which cost {budget} to produce, has now firmly established itself as one of the year\'s biggest hits. "This is a studio-defining moment," said one distribution executive.' },
  ],
  box_office_500m: [
    { headline: '"{film}" SMASHES HALF-BILLION MILESTONE', sub: 'Global phenomenon shows no signs of stopping at {gross}', body: 'In what analysts are calling one of the most remarkable box office runs in recent memory, {studio}\'s "{film}" has blown past $500 million worldwide. The {genre} epic continues to shatter records across international markets. "We haven\'t seen audience enthusiasm like this in years," reports senior analyst Michael Torres.' },
    { headline: 'HALF A BILLION AND COUNTING', sub: '{studio}\'s mega-hit "{film}" becomes global phenomenon', body: 'The numbers are in, and they\'re staggering: "{film}" has officially earned over $500 million worldwide. {studio}\'s {genre} tentpole has become the must-see event of the season, with repeat viewings driving unprecedented second-weekend holds across all territories.' },
  ],
  box_office_1b: [
    { headline: '"{film}" ENTERS BILLION DOLLAR CLUB', sub: '{studio} achieves the impossible with landmark {gross} worldwide gross', body: 'Stop the presses. "{film}" from {studio} has officially joined the elite billion-dollar club, a feat achieved by only a handful of films in cinema history. The {genre} masterwork has captivated audiences across every continent, proving that great storytelling knows no borders. "This changes everything for {studio}," declared industry veteran Robert Chen.' },
    { headline: 'ONE BILLION DOLLARS', sub: '{studio}\'s "{film}" achieves historic milestone', body: 'In a year of surprises, none is greater than this: "{film}" has earned over $1 billion at the worldwide box office. {studio}\'s {genre} epic has become a cultural phenomenon, transcending demographics and geography to become truly universal entertainment. Box office historians are already placing it among the all-time greats.' },
  ],
  major_flop: [
    { headline: 'BOX OFFICE DISASTER: "{film}" OPENS TO RECORD LOW', sub: '{studio}\'s ${budget} gamble fails spectacularly with only {gross} in returns', body: 'The whispered fears are now screaming headlines: "{film}," {studio}\'s ambitious {genre} project, has opened to catastrophically low numbers. With a production budget of {budget} and returns of just {gross}, this marks one of the most expensive failures in recent memory. Anonymous studio insiders call it "a complete misread of the market."' },
    { headline: '{budget} UP IN SMOKE', sub: '{studio}\'s "{film}" bombs at the box office; heads may roll', body: 'It\'s the flop everyone predicted but nobody wanted to see: "{film}" has cratered at the box office with a dismal {gross} against its {budget} budget. {studio} faces serious questions about its creative direction as shareholders react to the news. "This is a gut punch," admitted one distribution executive who requested anonymity.' },
    { headline: 'TITANIC DISASTER (NOT THE GOOD KIND)', sub: '"{film}" loses {loss} in biggest studio write-down of the year', body: 'The post-mortem on "{film}" has begun, and the numbers are ugly. {studio}\'s {genre} epic lost an estimated {loss}, making it the biggest financial disaster of the season. Analysts point to poor marketing, bad timing, and audience fatigue as contributing factors. "The warning signs were there," said one rival executive, barely concealing a smile.' },
  ],
  hostile_takeover: [
    { headline: 'HOSTILE BID ROCKS {studio}', sub: '{buyer} launches {offer} acquisition attempt; industry watches closely', body: 'In a bombshell that sent shockwaves through the entertainment industry, {buyer} has launched a hostile takeover bid for {studio}, valued at {offer}. The move comes amid a period of weakness for the target studio. "This is corporate warfare at its most aggressive," said M&A specialist Victoria Hayes. "The next few months will determine the fate of an iconic brand."' },
    { headline: 'CORPORATE RAIDERS TARGET {studio}', sub: '{buyer} moves to acquire struggling studio in {offer} bid', body: 'The sharks are circling. {buyer} has formally launched a {offer} hostile takeover bid for {studio}, citing "unlocked value and strategic opportunities." The embattled studio must now decide: fight or fold? Sources close to the deal say the bid reflects growing concern about {studio}\'s financial trajectory.' },
  ],
  takeover_defense: [
    { headline: '{studio} FIGHTS OFF HOSTILE BID', sub: 'Studio spends {cost} to repel {buyer}\'s acquisition attempt', body: 'David slays Goliath — or at least sends him packing. {studio} has successfully defended against {buyer}\'s hostile takeover attempt, spending {cost} on legal fees and poison pill defenses. "This studio is not for sale," declared the studio head to thunderous applause from employees. Industry observers note the defense came at a steep financial cost.' },
  ],
  streaming_launch: [
    { headline: '{studio} ENTERS STREAMING WARS', sub: 'New platform promises to reshape how audiences consume content', body: '{studio} has officially launched its streaming platform, joining an increasingly crowded digital landscape. The move signals the studio\'s commitment to direct-to-consumer content delivery. "This isn\'t just about streaming — it\'s about owning the relationship with our audience," said a studio spokesperson. Analysts project the service could reach profitability within 3-5 years.' },
    { headline: 'STREAMING SHAKEUP: {studio} GOES DIRECT', sub: 'Legacy studio bets big on digital future with platform launch', body: 'The streaming wars have a new combatant. {studio} today launched its own streaming service, betting that its library of beloved content and new original productions will attract subscribers. "Content is king, and we have the crown jewels," said the studio\'s digital chief. Rival streamers are reportedly monitoring the launch closely.' },
  ],
  subscribers_milestone: [
    { headline: '{studio} STREAMING HITS {count} SUBSCRIBERS', sub: 'Rapid growth puts studio in elite streaming tier', body: '{studio}\'s streaming platform has crossed the {count} subscriber mark, a milestone that validates the studio\'s digital-first strategy. The achievement comes amid fierce competition for viewer attention. "Every subscriber represents a vote of confidence in our content," said the platform\'s GM. Wall Street responded favorably, with the studio\'s stock ticking up.' },
  ],
  strike: [
    { headline: 'INDUSTRY STRIKE HALTS HOLLYWOOD', sub: 'All productions at {studio} suspended as union workers walk off sets', body: 'The picket signs are up and the cameras are off. A major industry strike has brought production to a standstill at {studio} and across Hollywood. Union leaders cite unfair compensation and working conditions as key grievances. "We will not be exploited any longer," declared the union president. Studios face mounting losses as every idle day costs millions.' },
    { headline: 'LIGHTS OUT: STRIKE SHUTS DOWN PRODUCTIONS', sub: 'Labor dispute forces {studio} to delay all active projects', body: 'Hollywood\'s worst fear has been realized. A crippling strike has forced {studio} and other major studios to halt all active productions. The dispute, which centers on compensation and AI-related concerns, could last months. "This is an existential fight for the creative workforce," said a union spokesperson. Entertainment stocks tumbled on the news.' },
  ],
  era_transition: [
    { headline: 'A NEW ERA DAWNS FOR CINEMA', sub: '{eraName}: {techDesc}', body: 'The entertainment industry stands at the threshold of a new chapter. {announcement} Industry experts predict sweeping changes to how films are made, distributed, and consumed. "Everything we thought we knew about moviemaking is about to change," said veteran producer Diana Kessler. Studios that adapt quickly will thrive; those that cling to the old ways risk extinction.' },
    { headline: 'THE FUTURE IS HERE', sub: 'Hollywood enters the age of {eraName}', body: '{announcement} As the industry transitions into the era of {eraName}, studios are scrambling to adapt their strategies. {techDesc} "It\'s sink or swim time," declared one studio executive. "The studios that embrace this change will define the next generation of entertainment." {studio} is among those positioning for the shift.' },
  ],
  economic_recession: [
    { headline: 'RECESSION HITS HOLLYWOOD', sub: 'Box office shrinks as audiences tighten their belts', body: 'The economic downturn has finally reached Tinseltown. Box office receipts are down sharply as consumers cut discretionary spending, and studios are feeling the pinch. "People are choosing groceries over movie tickets," lamented one theater chain executive. Studios are reportedly slashing marketing budgets and shelving risky projects. The question on everyone\'s mind: how long will this last?' },
    { headline: 'HARD TIMES FOR THE DREAM FACTORY', sub: 'Hollywood braces for economic storm as recession deepens', body: 'The gilt is off the lily. Hollywood is staring down its worst economic outlook in years as a deepening recession dampens consumer spending. Studios are implementing hiring freezes and delaying production starts. "We\'re battening down the hatches," admitted one studio CFO. Historically, audiences have turned to escapist entertainment during downturns — but will that pattern hold this time?' },
  ],
  economic_boom: [
    { headline: 'BOOM TIMES RETURN TO HOLLYWOOD', sub: 'Rising prosperity sends audiences flooding back to theaters', body: 'The champagne is flowing again on the Sunset Strip. A booming economy has reinvigorated the box office, with audiences spending freely on entertainment. Studios are greenlighting ambitious projects and expanding slates. "The audience is hungry and we\'re ready to feed them," declared one studio head. Analysts predict the good times could last several years.' },
  ],
  scandal: [
    { headline: 'SCANDAL ROCKS {studio} PRODUCTION', sub: '"{film}" plagued by {scandal} as studio scrambles for damage control', body: 'Trouble on set. {studio}\'s highly anticipated "{film}" has been rocked by a major scandal: {scandal}. The incident has generated a firestorm of negative press and could impact the film\'s commercial prospects. "This is a PR nightmare," said crisis communications expert Sandra Wells. "The studio needs to get ahead of this immediately."' },
  ],
  rival_collapse: [
    { headline: '{rival} STUDIOS SHUTTERS OPERATIONS', sub: 'Once-mighty studio collapses after years of declining fortunes', body: 'The unthinkable has happened: {rival}, once a titan of the entertainment industry, has formally ceased operations. The closure follows years of declining box office returns, mounting debt, and a series of high-profile flops. Thousands of employees face uncertain futures. "It\'s the end of an era," said a tearful former executive. "This studio made some of the greatest films ever produced."' },
  ],
  world_event: [
    { headline: '{eventName} DISRUPTS GLOBAL FILM INDUSTRY', sub: 'Studios scramble to adapt as {eventDesc}', body: 'Hollywood is reeling from {eventName}, which has upended production schedules and release calendars across the industry. Studios are being forced to rethink their strategies in real-time. "Nobody planned for this," admitted one production chief. "But the show must go on — we just need to figure out what that looks like now." {studio} is reportedly among the studios most affected.' },
  ],
  ipo: [
    { headline: '{studio} GOES PUBLIC', sub: 'Studio valued at {value} in landmark IPO; shares begin trading', body: 'The bell has been rung. {studio} has officially gone public, with shares beginning trading at {price} per share, valuing the studio at approximately {value}. The IPO was reportedly oversubscribed, reflecting strong investor confidence in the studio\'s creative pipeline and strategic direction. "Today marks a new chapter," said the studio\'s CEO. "We have the resources to dream bigger."' },
  ],
  acquisition: [
    { headline: '{studio} ACQUIRES {target}', sub: 'Strategic acquisition reshapes competitive landscape', body: 'In a bold move that reshapes the industry landscape, {studio} has completed the acquisition of {target}. The deal gives {studio} access to {target}\'s talent pipeline, IP library, and production infrastructure. "This is about building the studio of the future," said {studio}\'s strategic planning chief. Rival studios are reportedly reassessing their own M&A strategies in response.' },
  ],
  ip_purchase: [
    { headline: '{studio} ACQUIRES "{ipName}" RIGHTS', sub: 'Major IP deal worth {price} signals franchise strategy shift', body: 'In a {dealSize} acquisition, {studio} has secured the exclusive rights to the popular {ipCategory} "{ipName}." The {ipCategory} is a proven commodity with {recognition}% public recognition. "This acquisition positions us to build a major franchise," said the studio\'s head of development. Industry insiders note the move reflects the studio\'s strategic pivot toward IP-driven tentpoles.' },
    { headline: '{studio} MOVES BIG ON INTELLECTUAL PROPERTY', sub: 'Studio pays {price} for "{ipName}" rights in franchise play', body: '{studio} has made a significant bet on future tentpole success by acquiring the rights to "{ipName}," a {ipCategory} with substantial fanbase appeal. The acquisition cost of {price} reflects the IP\'s franchise potential and audience recognition level. "This is exactly the kind of foundational IP we need to build a cinematic universe," said development executives. Analysts view the move as a necessary step in competing with larger studios.' },
  ],
  ip_sleeper_hit: [
    { headline: 'SURPRISE HIT: {studio}\'s "{film}" BREAKS OUT BASED ON IP', sub: 'Low-budget adaptation of "{ipName}" becomes phenomenon', body: 'Nobody expected it. {studio}\'s {budget} adaptation of the {ipCategory} "{ipName}" has exceeded all projections, becoming the sleeper hit of the season. The film\'s success has industry analysts scrambling to reassess IP adaptation strategies. "This proves that great storytelling beats big budgets," said BoxOffice Pro analyst Janet Kim. "{studio} understood the source material\'s appeal in ways bigger studios missed."' },
  ],
  ip_major_flop: [
    { headline: 'IP GAMBLE FAILS: "{film}" BOMBS AT BOX OFFICE', sub: '{studio} loses {loss} on adaptation of "{ipName}"', body: 'Sometimes beloved source material doesn\'t translate to the big screen. {studio}\'s highly anticipated adaptation of the {ipCategory} "{ipName}" has underperformed dramatically, losing an estimated {loss}. Industry observers point to the creative team\'s departure from source material as a key factor in the failure. "You can\'t just slap a popular IP on a bad movie and expect success," noted media analyst Robert Chen.' },
  ],
};

const NEWSPAPER_QUOTES = [
  'According to industry insiders',
  'Wall Street analysts note',
  'Veteran producer Diana Kessler observed',
  'As noted by entertainment journalist Bob Feld',
  'Sources close to the deal confirm',
  'Anonymous studio executives suggest',
  'Box office analyst Janet Kim reports',
  'As one talent agent put it',
  'Industry watchdog reports indicate',
  'Per multiple sources familiar with the matter',
];

// ==================== BIDDING WAR SYSTEM ====================
const BIDDING_PERSONALITIES = {
  aggressive: { raiseMult: [1.15, 1.35], foldChance: 0.05 },
  conservative: { raiseMult: [1.05, 1.15], foldChance: 0.25 },
  prestige: { raiseMult: [1.10, 1.30], foldChance: 0.10 },
  cheapskate: { raiseMult: [1.02, 1.10], foldChance: 0.40 },
};
const getBiddingPersonality = (rival) => {
  if (!rival) return BIDDING_PERSONALITIES.conservative;
  if (rival.reputation > 75) return BIDDING_PERSONALITIES.aggressive;
  if ((rival.prestige || 0) > 60) return BIDDING_PERSONALITIES.prestige;
  if (rival.cash < 100e6) return BIDDING_PERSONALITIES.cheapskate;
  return BIDDING_PERSONALITIES.conservative;
};

const makeNewspaper = (type, data, year, month, edition) => {
  const templates = NEWSPAPER_HEADLINES[type];
  if (!templates || templates.length === 0) return null;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const fill = (str) => {
    if (!str) return str;
    let s = str;
    Object.entries(data).forEach(([k, v]) => { s = s.split(`{${k}}`).join(String(v)); });
    return s;
  };
  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Determine newspaper era style
  let eraStyle = 'classic';
  if (year >= 2000) eraStyle = 'digital';
  else if (year >= 1960) eraStyle = 'modern';
  const paper = NEWSPAPER_NAMES.find(n => n.era === eraStyle) || NEWSPAPER_NAMES[0];
  return {
    id: `news_${edition}_${Date.now()}`,
    type,
    headline: fill(template.headline),
    subheadline: fill(template.sub),
    body: fill(template.body),
    date: `${MONTH_NAMES_SHORT[month - 1]} ${year}`,
    year,
    month,
    edition,
    paperName: paper.name,
    paperTagline: paper.tagline,
    eraStyle,
    secondary: data.secondary || null,
  };
};

// ==================== DIRECTOR-ACTOR CHEMISTRY ====================
const calcChemistry = (directorId, actorId, films) => {
  const collabs = films.filter(f => f.status === 'released' && f.director?.id === directorId && f.actor?.id === actorId);
  if (collabs.length === 0) return { count: 0, bonus: 0 };
  const avgQuality = collabs.reduce((s, f) => s + f.quality, 0) / collabs.length;
  // Bonus increases with number of collabs and their avg quality
  const bonus = Math.min(collabs.length * 2, 10) + (avgQuality > 70 ? 5 : avgQuality > 50 ? 2 : 0);
  return { count: collabs.length, bonus, avgQuality: Math.round(avgQuality) };
};

// ==================== STAR POWER ====================
const calcStarPower = (actor) => {
  if (!actor) return 0;
  // Star power = popularity * 0.3 + skill * 0.2 + filmography bonus
  let power = actor.popularity * 0.3 + actor.skill * 0.2;
  if (actor.filmography >= 10) power += 10;
  else if (actor.filmography >= 5) power += 5;
  // Trait bonuses
  if (actor.trait === 'Box Office Draw') power += 15;
  if (actor.trait === 'International Star') power += 10;
  if (actor.trait === 'Fan Favorite') power += 8;
  return Math.round(clamp(power, 0, 100));
};

// ==================== THEATRICAL RUN SIMULATION ====================

const simulateTheatricalRun = (totalGross, quality, genre, rating) => {
  // Simulate week-by-week box office over a theatrical run
  // Opening weekend: bigger for blockbusters, star power, marketing
  // Typical drop-off: 40-60% per week, better legs for quality films
  const weeks = [];
  const isBlockbuster = ['Action', 'Sci-Fi', 'Animation', 'Fantasy'].includes(genre);
  const isPrestige = ['Drama', 'Documentary'].includes(genre);

  // Opening weekend share: blockbusters front-load, prestige films have legs
  let openingShare = isBlockbuster ? 0.30 + Math.random() * 0.10
    : isPrestige ? 0.15 + Math.random() * 0.08
    : 0.20 + Math.random() * 0.10;

  // Quality affects legs (how slowly the film drops off)
  const dropRate = quality >= 85 ? 0.30 + Math.random() * 0.10
    : quality >= 70 ? 0.35 + Math.random() * 0.10
    : quality >= 50 ? 0.45 + Math.random() * 0.10
    : 0.55 + Math.random() * 0.15;

  // R-rated films tend to front-load more
  if (rating === 'R' || rating === 'NC-17') openingShare *= 1.15;

  const openingGross = Math.round(totalGross * openingShare);
  let remaining = totalGross - openingGross;
  let weeklyGross = openingGross;
  let cumulative = 0;

  // Generate 12 weeks of data
  for (let w = 1; w <= 12; w++) {
    if (w === 1) {
      weeklyGross = openingGross;
    } else {
      // Apply drop-off with some variance
      const thisDropRate = dropRate + (Math.random() - 0.5) * 0.08;
      weeklyGross = Math.round(weeklyGross * (1 - thisDropRate));
      // Occasional bump (word of mouth, awards buzz)
      if (quality >= 75 && w >= 4 && Math.random() < 0.15) {
        weeklyGross = Math.round(weeklyGross * 1.3); // 30% bump
      }
    }
    weeklyGross = Math.max(weeklyGross, 0);
    cumulative += weeklyGross;

    weeks.push({
      week: w,
      gross: weeklyGross,
      cumulative: Math.min(cumulative, totalGross),
      label: `Wk ${w}`,
    });

    // End theatrical run if weekly gross drops below threshold
    if (w > 3 && weeklyGross < totalGross * 0.01) break;
  }

  // Normalize cumulative to match actual total gross
  if (weeks.length > 0 && cumulative > 0) {
    const scale = totalGross / cumulative;
    let runningTotal = 0;
    weeks.forEach(w => {
      w.gross = Math.round(w.gross * scale);
      runningTotal += w.gross;
      w.cumulative = runningTotal;
    });
  }

  return weeks;
};

// ==================== GAME LOGIC ====================

const calcQuality = (film, facilitiesLevel, genreTrend, specialization) => {
  const d = film.director, a = film.actor, w = film.writer;
  let base = d.skill * 0.30 + a.popularity * 0.10 + a.skill * 0.15 + w.skill * 0.25 + facilitiesLevel * 3;
  // Career arc modifiers
  if (d.age) base += (getCareerPhase(d.age).skillMod * 0.3);
  if (a.age) base += (getCareerPhase(a.age).skillMod * 0.2);
  if (w.age) base += (getCareerPhase(w.age).skillMod * 0.25);
  base += Math.log10(Math.max(film.budget / 1e6, 0.5) + 1) * 8; // +1 so $1M budget still contributes
  // Morale affects quality
  const avgMorale = ((d.morale || 75) + (a.morale || 75) + (w.morale || 75)) / 3;
  base += (avgMorale - 75) * 0.15;
  // Studio specialization bonus
  const spec = SPECIALIZATIONS[specialization || 0]?.bonus || {};
  if (spec.qualityGenres && (spec.qualityGenres.includes(film.genre) || (film.genre2 && spec.qualityGenres.includes(film.genre2)))) base += (spec.qualityBonus || 0);
  if (spec.lowBudgetBonus && film.budget < (spec.lowBudgetThreshold || 20e6)) base += spec.lowBudgetBonus;
  // Multi-genre bonus: if talent has genre bonus matching secondary genre
  if (film.genre2) {
    if (d.genreBonus === film.genre2) base += 3;
    if (w.genreBonus === film.genre2) base += 3;
    base += 2; // inherent small bonus for genre blending
  }
  if (d.genreBonus === film.genre) base += 5;
  if (w.genreBonus === film.genre) base += 5;
  base += (genreTrend || 0) * 8;

  // Apply trait bonuses to quality
  const de = d.traitEffect || {}, ae = a.traitEffect || {}, we = w.traitEffect || {};
  if (de.qualityFlat) base += de.qualityFlat;
  if (de.qualityBonus && de.genres && de.genres.includes(film.genre)) base += de.qualityBonus;
  if (ae.qualityBonus && ae.genres && ae.genres.includes(film.genre)) base += ae.qualityBonus;
  if (we.qualityBonus && we.genres && we.genres.includes(film.genre)) base += we.qualityBonus;
  if (de.lowBudgetBonus && film.budget < 30e6) base += de.lowBudgetBonus;

  // Apply adaptation/sequel/reboot quality bonuses
  if (film._qualityBonus) base += film._qualityBonus;

  // Coalition quality bonus
  if (film._coalitionQualityMod) base += film._coalitionQualityMod;

  // Filmmaking era quality modifier
  if (film._eraQualityMod !== undefined) base += film._eraQualityMod;
  // Era-specific genre bonuses
  if (film._eraId) {
    if (film._eraId === 'digital' && ['Sci-Fi', 'Action', 'Fantasy', 'Animation'].includes(film.genre)) base += 4; // CGI revolution boosts VFX genres
    if (film._eraId === 'franchise' && film.franchiseId !== null) base += 3; // Franchise era rewards franchise films
    if (film._eraId === 'aiAge' && ['Sci-Fi', 'Fantasy'].includes(film.genre)) base += 3; // Virtual production boosts these
    if (film._eraId === 'immersive' && ['Action', 'Sci-Fi', 'Fantasy', 'Horror'].includes(film.genre)) base += 5; // Immersive tech
    if (film._eraId === 'silent' && ['Drama', 'Comedy', 'Horror'].includes(film.genre)) base += 3; // Silent era masters
  }

  // Budget allocation quality impact
  if (film.budgetAlloc) {
    const alloc = film.budgetAlloc;
    const isVFXHeavy = ['Action', 'Sci-Fi', 'Animation', 'Fantasy'].includes(film.genre);
    const isPerformanceDriven = ['Drama', 'Romance', 'Comedy', 'Musical'].includes(film.genre);
    if (isVFXHeavy && alloc.vfx >= 30) base += 4;
    if (isPerformanceDriven && alloc.cast >= 30) base += 4;
    if (alloc.editing >= 25) base += 2;
    if (alloc.music >= 25) base += 2;
    Object.values(alloc).forEach(v => { if (v < 10) base -= 3; });
  }

  // Director vs Studio control
  if (film.studioControl !== undefined) {
    const dirControl = 100 - film.studioControl;
    if (dirControl >= 70) base += 4;
    if (dirControl >= 90) base += 3;
  }

  // Producer contribution
  if (film.producer) {
    base += film.producer.skill * 0.10; // producers add stability
    if (film.producer.traitEffect?.qualityFlat) base += film.producer.traitEffect.qualityFlat;
    if (film.producer.traitEffect?.qualityVariance && !film._preview) base += randInt(-film.producer.traitEffect.qualityVariance, film.producer.traitEffect.qualityVariance);
  }

  // Theme bonuses
  if (film.themes && film.themes.length > 0) {
    film.themes.forEach(tid => {
      const theme = FILM_THEMES.find(t => t.id === tid);
      if (theme) {
        // Genre-theme synergy: bonus if theme fits genre
        if (theme.genreBonus.includes(film.genre)) base += 4;
        if (film.genre2 && theme.genreBonus.includes(film.genre2)) base += 2;
        // Multi-theme depth bonus (two themes that work together feel richer)
      }
    });
    if (film.themes.length === 2) base += 2; // thematic depth bonus
  }

  if (!film._preview) base += (Math.random() - 0.5) * 12; // randomness only at greenlight, not during preview
  return Math.round(clamp(base, 5, 98));
};

const calcBoxOffice = (quality, budget, marketing, year, genre, film) => {
  const budgetM = budget / 1e6;
  const tier = getBudgetTier(budget);

  // === REALISTIC BOX OFFICE SCALING ===
  const qNorm = clamp(quality, 0, 100) / 100;

  // Quality-to-multiplier: steeper curve where bad films flop hard, good films earn well
  // Most films lose money — only quality >60 starts reliably profiting
  const qualityMult = 0.15 + Math.pow(qNorm, 2.5) * (tier.hitMultiplier - 0.15);
  const variance = 0.2 + qNorm * 0.3;
  const grossMult = qualityMult * (1 + (Math.random() - 0.5) * variance);

  // Marketing affects awareness (opening weekend) more than total gross
  const marketRatio = Math.min(marketing / Math.max(budget, 1), 1.5);
  const marketMult = 0.7 + marketRatio * 0.5; // undermarketed films can still succeed via word of mouth

  // Star power from cast affects opening weekend draw
  let starPowerMult = 1.0;
  if (film) {
    const castSP = film.castMembers ? calcCastStarPower(film.castMembers) : (film.actor?.popularity || 0);
    starPowerMult = 1.0 + (castSP / 100) * 0.35; // up to +35% for max star power
    // No-name cast: marketing is harder but sleeper potential exists
    if (castSP < 20) {
      starPowerMult = 0.75;
      if (qNorm > 0.8) starPowerMult = 0.9; // quality compensates slightly
    }
  }

  // Base domestic — use budget tier ceiling as scaling reference
  let domestic = Math.min(budgetM * grossMult * marketMult * starPowerMult * 1e6, tier.grossCeiling * 0.4);

  // International ratio varies by genre
  const isGlobalGenre = ['Action', 'Sci-Fi', 'Animation', 'Fantasy'].includes(genre);
  const isDialogueHeavy = ['Drama', 'Comedy', 'Romance', 'Documentary', 'Musical'].includes(genre);
  let intlRatio = isGlobalGenre ? 1.4 : isDialogueHeavy ? 0.6 : 0.9; // blockbusters: 60% intl, dramas: 37%
  intlRatio *= (0.85 + Math.random() * 0.3); // variance

  // Era multiplier for intl (markets grow over time)
  intlRatio *= (0.8 + getEraIntlMult(year) * 0.4);

  let international = 0;
  const intlBase = domestic * intlRatio;
  const regionBreakdown = {};
  INTL_REGIONS.forEach(region => {
    let regionGross = intlBase * region.share;
    const genreAdj = region.genreBonus[genre] || 0;
    regionGross *= (1 + genreAdj);
    regionBreakdown[region.id] = Math.round(regionGross);
    international += regionGross;
  });

  // Cap total gross at tier ceiling
  if (domestic + international > tier.grossCeiling) {
    const scale = tier.grossCeiling / (domestic + international);
    domestic *= scale;
    international *= scale;
  }

  // Apply trait effects to box office
  if (film) {
    const de = film.director?.traitEffect || {}, ae = film.actor?.traitEffect || {}, we = film.writer?.traitEffect || {};
    if (de.grossBonus) { domestic *= (1 + de.grossBonus); international *= (1 + de.grossBonus); }
    if (ae.domesticBonus) domestic *= (1 + ae.domesticBonus);
    if (we.domesticBonus) domestic *= (1 + we.domesticBonus);
    if (ae.intlBonus) international *= (1 + ae.intlBonus);
  }

  // Multi-genre audience broadening
  if (film && film.genre2) { domestic *= 1.08; international *= 1.06; }

  // Specialization bonuses
  if (film && film._specBonus) {
    const sb = film._specBonus;
    if (sb.grossGenres && sb.grossGenres.includes(genre)) { domestic *= (1 + (sb.grossBonus || 0)); international *= (1 + (sb.grossBonus || 0)); }
    if (sb.intlGenres && sb.intlGenres.includes(genre)) { international *= (1 + (sb.intlBonus || 0)); }
  }

  // Franchise/sequel/reboot
  if (film && film.franchiseId !== null && film.filmType === 'sequel') {
    const seqNum = film.sequelNumber || 1;
    const franchiseBoost = Math.min(seqNum * 0.08, 0.4);
    const fatigueFactor = seqNum <= 3 ? 1.0 : Math.max(0.5, 1.0 - (seqNum - 3) * 0.12);
    domestic *= (1 + franchiseBoost) * fatigueFactor;
    international *= (1 + franchiseBoost) * fatigueFactor;

    // Second film in IP franchise often bigger (audience returns)
    if (film.sequelNumber === 2 && film.isIP) {
      domestic *= 1.15;
      international *= 1.15;
    }
  }
  if (film && film.franchiseId !== null && film.filmType === 'reboot') { domestic *= 1.15; international *= 1.15; }
  if (film && film.filmType === 'adaptation' && film._marketingMult) { domestic *= film._marketingMult; international *= film._marketingMult; }

  // Espionage penalties
  if (film && film._twinFilmPenalty) { domestic *= (1 - film._twinFilmPenalty); international *= (1 - film._twinFilmPenalty); }
  if (film && film._leakedScript) { domestic *= 0.85; international *= 0.85; }

  // Era revenue modifier
  if (film && film._eraBudgetMult) {
    const eraRevMult = 0.7 + film._eraBudgetMult * 0.3;
    domestic *= eraRevMult; international *= eraRevMult;
  }

  // Marketing phase bonuses
  if (film && film.marketingPhases && film.marketingPhases.length > 0) {
    let mBuzz = 0;
    film.marketingPhases.forEach(pid => {
      const ph = MARKETING_PHASES.find(p => p.id === pid);
      if (ph) mBuzz += ph.buzzMult;
    });
    domestic *= (1 + mBuzz * 0.04);
    international *= (1 + mBuzz * 0.02);
  }

  // Studio control commercial impact
  if (film && film.studioControl !== undefined) {
    if (film.studioControl >= 70) { domestic *= 1.06; international *= 1.06; }
    if (100 - film.studioControl >= 70) { domestic *= 0.96; }
  }

  // === WORD OF MOUTH / LEGS ===
  // High audience score = good holds = higher total. Low = frontloaded.
  const audienceScorePreview = film ? calcSplitScores(quality, film, budget, marketing).audienceScore : 60;
  const womMultiplier = audienceScorePreview >= 85 ? 1.25 : audienceScorePreview >= 70 ? 1.1 : audienceScorePreview >= 50 ? 1.0 : audienceScorePreview >= 30 ? 0.85 : 0.7;
  domestic *= womMultiplier;
  international *= womMultiplier;

  // === SLEEPER HIT ===
  if (film && budgetM < 25 && audienceScorePreview >= 80 && quality >= 65) {
    const sleeperMult = calcSleeperMultiplier({ ...film, audienceScore: audienceScorePreview, quality });
    domestic *= sleeperMult;
    international *= sleeperMult * 0.8; // sleepers are mostly domestic phenomena
  }

  // === COMPUTE SPLIT SCORES (Critics vs Audience) ===
  const scores = film ? calcSplitScores(quality, film, budget, marketing) : { criticScore: quality, audienceScore: quality };
  let { criticScore, audienceScore } = scores;

  // Marketing phase score mods
  if (film && film.marketingPhases && film.marketingPhases.length > 0) {
    film.marketingPhases.forEach(pid => {
      const ph = MARKETING_PHASES.find(p => p.id === pid);
      if (ph) { criticScore = clamp(criticScore + ph.criticMod, 5, 99); audienceScore = clamp(audienceScore + ph.audienceMod, 5, 99); }
    });
  }

  // Post-prod audience mod
  if (film && film._postProdAudienceMod) audienceScore = clamp(audienceScore + film._postProdAudienceMod, 5, 99);

  // Trait score mods
  if (film) {
    const we = film.writer?.traitEffect || {}, de = film.director?.traitEffect || {};
    if (we.criticBonus) criticScore = clamp(criticScore + we.criticBonus, 5, 99);
    if (de.audienceBonus) audienceScore = clamp(audienceScore + de.audienceBonus, 5, 99);
    if (we.audienceBonus) audienceScore = clamp(audienceScore + we.audienceBonus, 5, 99);
  }

  // IP audience floor — recognized IPs guarantee minimum audience
  if (film && film.isIP && film.ipRecognition > 0) {
    const cat = IP_CATEGORIES[film.ipCategory] || {};
    const audienceFloor = (cat.audienceFloor || 0) * IP_AUDIENCE_MULT[film.ipAudience || 'medium'];
    const floorDomestic = tier.grossCeiling * audienceFloor * 0.3; // floor is % of ceiling
    if (domestic < floorDomestic) domestic = floorDomestic;
  }

  // === FINAL PROFIT ===
  const totalGross = domestic + international;
  // Opening weekend estimate (for display): 25-40% of domestic
  const openingPct = audienceScore >= 80 ? 0.25 : audienceScore >= 50 ? 0.32 : 0.40; // good WOM = lower opening %
  const openingWeekend = Math.round(domestic * openingPct);
  const profit = Math.round(domestic * 0.50 + international * 0.25 - budget - marketing);

  return {
    domestic: Math.round(domestic),
    international: Math.round(international),
    totalGross: Math.round(totalGross),
    profit,
    criticScore,
    audienceScore,
    regionBreakdown,
    openingWeekend,
    budgetTier: tier.id,
    isSleeper: budgetM < 25 && audienceScore >= 80 && quality >= 65,
  };
};

// ==================== REDUCER ====================

const INIT = {
  phase: 'title',
  studioName: '',
  studioColor: 0,          // index into STUDIO_COLORS
  specialization: 0,       // index into SPECIALIZATIONS
  studioMotto: '',
  year: 1970, month: 1, turn: 0,
  cash: 5000000,
  reputation: 20, prestige: 10,
  facilitiesLevel: 1,
  studioLots: [],             // [{id, name, inUse: boolean}] — owned studio lots
  films: [],
  contracts: [],
  availableTalent: [],
  franchises: [],
  streamingPlatform: null,
  awards: [],
  cashHistory: [],
  gameLog: [],
  milestones: { indieDarling: false, boxOfficeKing: false, franchiseBuilder: false, studioMogul: false, streamingPioneer: false, hollywoodLegend: false },
  totalGross: 0, totalAwards: 0,
  scripts: [],
  ipMarketplace: [],
  ownedIPs: [],
  pendingScreenplays: [],
  devMode: 'browse',
  screenplayBudget: 1,
  screenplayTurns: 2,
  devIPIdx: -1,
  ipFilterCategory: null,
  competitors: [],
  genreTrends: {},
  nextId: 100,
  // Business
  loans: [],
  distributionDeal: null,       // active distribution deal
  distributionTurnsLeft: 0,
  rivalFilms: [],               // recent rival releases for display
  rivalFilmsThisYear: [],     // accumulated rival films for annual awards
  allFilmHistory: [],          // permanent record of ALL films ever made (player + rival)
  // dev UI
  devScriptIdx: -1,
  devBudgetM: 10,
  devMarketingM: 0,
  devDirectorId: null,
  devActorId: null,         // lead actor
  devSupporting1Id: null,    // supporting actor 1
  devSupporting2Id: null,    // supporting actor 2
  devEnsembleId: null,       // ensemble actor
  devWriterId: null,
  devProducerId: null,
  devFilmType: 'original',  // 'original' | 'sequel' | 'reboot' | 'adaptation'
  devAdaptation: null,      // index into ADAPTATIONS
  devFranchiseId: null,     // for sequels/reboots
  devGenre2: null,          // secondary genre (multi-genre)
  devTone: 'serious',       // tone of the film
  devRating: 'PG-13',          // target MPAA rating
  devThemes: [],             // up to 2 theme ids
  devBudgetAlloc: { cast: 20, vfx: 20, production: 20, music: 20, editing: 20 },  // budget allocation percentages
  devStudioControl: 50,     // 0=director, 100=studio
  devMarketingPhases: [],   // selected marketing phases
  devInvestor: null,        // investor type id (null or 'angel'/'equity'/'slate')
  devInsured: false,        // whether to purchase insurance
  devPostProdChoice: 'standard_edit', // post-production decision
  competingFilms: [],        // rival films releasing same month
  flopCooldown: 0,           // months of reputation damage remaining from flops
  customScriptGenre: null,     // genre for custom script
  customScriptGenre2: null,    // secondary genre for custom script
  customScriptTitle: '',       // player-typed title
  customScriptLogline: '',     // player-typed logline
  customScriptWriterId: null,  // writer assigned to write the script
  taxDeductions: [],        // array of selected tax deduction ids
  annualTaxPaid: 0,         // cumulative tax paid
  yearlyProfitForTax: 0,    // tracked for annual tax calculation
  errorMsg: '',
  // Scenario mode
  scenario: 'sandbox',
  scenarioGoal: null,
  scenarioDeadline: null,
  scenarioWon: false,
  // Achievements & Challenges
  unlockedAchievements: [],
  totalFilmsReleased: 0,
  // Awards & Legacy
  annualAwards: [],         // [{year, awards: [{category, film, studio}]}]
  awardsCampaigns: {},        // filmId -> amount spent on awards campaign
  boxOfficeChart: [],       // top films this month across all studios
  legacyScore: 0,
  pendingCeremony: null,    // ceremony data waiting to be viewed
  newspaperQueue: [],       // newspapers waiting to be displayed
  newspaperArchive: [],     // past newspapers for the archive
  newspaperEdition: 0,      // running edition counter
  walkOfFame: [],           // [{name, type, yearInducted, achievement}]
  celebration: null,        // {type: 'confetti'|'fireworks', color: 'gold'|'green', message: ''}
  activeBidding: null,      // bidding war state
  showCeremony: false,      // whether awards show modal is active
  // ---- NEW FEATURES ----
  // Filming location
  devLocation: 'hollywood', // filming location id
  // Ratings
  filmRatings: {},          // filmId -> rating string
  // Tech tree
  unlockedTech: [],         // array of tech ids
  // Cultural movements (auto-calculated, stored for display)
  activeMovements: [],
  activeCrises: [],           // [{id, name, monthsLeft, effects}]
  genreFanbase: {},           // genre -> {loyalty: 0-100, films: count} — audience loyalty per genre
  // Film festivals
  festivalSubmissions: [],  // [{filmId, festivalId, year, result}]
  // TV division
  tvShows: [],              // [{id, title, format, genre, showrunnerId, quality, seasons, currentSeason, episodes, episodeCost, totalCost, status:'development'|'production'|'airing'|'renewed'|'cancelled'|'ended', viewership, criticScore, subscriberImpact, turnsInStatus, turnsNeeded, releaseStrategy}]
  tvDevFormat: null,        // selected TV format id
  tvDevShowrunnerId: null,  // showrunner for TV development
  tvDevEpisodes: 8,         // episode order
  tvDevBudgetPerEp: 3,      // budget per episode in $M
  tvDevTitle: '',           // custom title
  tvDevDistribution: 'streaming_exclusive', // distribution strategy
  devTvGenre: null,
  licensingDeals: [],       // [{id, type:'in'|'out', partner, contentTitle, contentType:'film'|'show', monthlyFee, monthsLeft}]
  streamingHistory: [],     // [{turn, subscribers, revenue, churn, contentCount}]
  windowingStrategy: 'exclusive_45', // default windowing for hybrid releases
  rivalStreamers: [],               // AI rival streaming platforms [{name, subscribers, contentCount, quality, ...}]
  _streamingName: '',       // temp UI state for streaming platform name
  _streamingTier: 'standard', // temp UI state for streaming tier
  // Director's cuts
  reReleases: [],           // [{filmId, year, grossBonus}]
  // Co-productions
  coProductions: [],        // [{filmId, rivalName, costShare, profitShare}]
  // Soundtrack/music
  soundtrackRevenue: 0,     // cumulative
  // M&A
  acquiredStudios: [],      // names of acquired rival studios
  hostileTakeoverOffer: null,
  takeoverCooldown: 0,        // months until another takeover can be attempted
  takeoverWarningLevel: 0,    // 0=none, 1=rumors, 2=activist investors, 3=full bid
  stockPricePeak: 0,          // highest stock price ever reached
  consecutiveFlops: 0,        // streak of consecutive money-losing films
  startYear: 1970,            // year the game started (for gating mechanics)
  // IPO / Stock market
  isPublic: false,
  stockPrice: 0,
  stockHistory: [],         // [{turn, price}]
  shareholderDemand: 0,     // 0-100, pressure for returns
  // Theater chains
  theaterChains: [],        // [{...chain, owned: true}]
  // Theme parks
  themeParks: [],           // [{...tier, franchiseId, turnsLeft, operational}]
  // Merchandise
  merchandiseRevenue: 0,
  // Talent academy
  academy: [],              // [{id, name, type, skill, turnsLeft, potential}]
  // Chemistry tracking (auto-built from films)
  chemistryPairs: {},       // `${dirId}-${actId}` -> {count, bonus, avgQuality}
  // Star power cache
  starPowerCache: {},       // talentId -> power
  // Talent negotiation state
  pendingNegotiation: null, // {talentId, counterOffer, perks, exclusive}
  // ---- BATCH 4 FEATURES ----
  // Feature 12: Press/Media System
  pressEvents: [],          // [{id, type, talentId/filmId, response, repImpact, buzzImpact, prestigeImpact}]
  // Feature 13: Film School Pipeline
  filmSchools: [],          // [{id, schoolId, founded: turn, nextGraduate: turn, graduatesQueue: [talent]}]
  // Feature 14: International Studio Partnerships
  internationalPartners: [], // [{id, partnerId, formDate: year, active: bool}]
  // ---- SYSTEM 1: GENRE TRENDS & AUDIENCE FATIGUE ----
  genreCycleState: {},        // genre -> {phase: 'stable'|'boom'|etc, momentum: -100..100, filmsThisYear: 0}
  genreFatigueLog: [],        // [{genre, year, films, effect}]
  // ---- SYSTEM 2: TALENT RELATIONSHIPS ----
  talentMoods: {},            // talentId -> mood score
  // ---- SYSTEM 3: AWARDS CAMPAIGNS ----
  awardsCampaignsDetailed: {}, // filmId -> {strategy, spent, categories, effectMult}
  // ---- SYSTEM 4: FILM CATALOG ----
  catalogRevenue: 0,          // monthly catalog revenue
  cultClassics: [],           // film ids that became cult classics
  // ---- SYSTEM 5: CINEMATIC UNIVERSES ----
  cinematicUniverses: [],     // [{id, name, franchiseIds: [], tier: 'shared', brandHealth: 100}]
  // ---- SYSTEM 6: RELEASE STRATEGY ----
  devReleaseStrategy: 'wide_theatrical',
  devReleaseMonth: null,      // null = auto, 1-12 = target month
  // ---- FEATURE 2: NAMED FILM CRITICS ----
  // Critics and reviews auto-generated on release
  // ---- FEATURE 3: END-OF-YEAR SUMMARY ----
  pendingYearSummary: null,
  showYearSummary: false,
  // ---- FEATURE 6: INTERNATIONAL BOX OFFICE ----
  // intlBreakdown calculated per film on release
  // ---- TURN SUMMARY SYSTEM ----
  turnSummary: null,          // { sections: {...}, turnNum, year, month, yearSummary } — built at end of turn
  showTurnSummary: false,     // whether the turn summary panel is showing
  turnSummaryExpanded: {},    // { sectionId: true/false } — which sections are expanded
  // Tab notification badges
  tabBadges: {},              // { tabName: count } — notification badges on tabs
  // Event feed categories
  logFilter: 'all',           // 'all' | 'boxoffice' | 'talent' | 'market' | 'streaming' | 'rivals' | 'production'
  // ---- FEATURE 7: STUDIO GENRE IDENTITY ----
  genreIdentity: {},          // genre -> {films: count, reputation: 0-100}
  // ---- SYSTEM 7: STUDIO FACILITIES ----
  studioFacilities: [],       // [{id, facilityId, built: turn}]
  // ---- SYSTEM 8: ZEITGEIST EVENTS ----
  activeZeitgeist: [],        // [{id, name, monthsLeft, grossMult, genreBoost, ...}]
  // ---- SYSTEM 9: DISTRIBUTION ----
  distributionTier: 'self',   // current distribution deal tier
  theaterRelationship: 50,    // 0-100 relationship with theater chains
  // ---- SYSTEM 1: FILMMAKING ERAS ----
  currentFilmEra: 'newHollywood',
  // ---- SYSTEM 2: ACQUISITIONS & FINANCIAL ----
  acquisitions: [],
  coProductionProposals: [],
  // ---- SYSTEM 3: ECONOMIC & EVENTS ----
  economicCycle: { phase: 'stable', monthsLeft: 48 },
  worldEventsTriggered: [],
  aiStudiosSpawned: [],
  laborRelations: 'neutral',
  // ---- SYSTEM 4: TALENT RELATIONSHIPS ----
  talentRelationships: {},
  talentCareerStages: {},
  pendingDealNegotiation: null,
  // ---- AI COMPETITION SYSTEMS ----
  rivalMarketShare: {},         // genre -> {studioName: sharePercent}
  rivalStrategies: {},          // studioName -> {copiedGenre, counterTarget, lastPivot}
  rivalAlliances: [],           // [{studios: [name1, name2], purpose, monthsLeft}]
  rivalAcquisitions: {},        // studioName -> [{type, name, year}]
  activeEspionage: [],          // [{type, rivalName, targetFilmId, monthsLeft, effects}]
  playerEspionage: [],          // [{type, targetRival, monthsLeft, active}]
  studioSecurity: 0,            // 0-100, reduces espionage success rate
  industryCoalitions: [],       // [{id, members: [studioNames], monthsLeft, effects}]
  activeRegulations: [],        // [{id, name, monthsLeft, effects}]
  playerCoalition: null,        // coalition id player has joined
  rivalBidWars: [],             // [{scriptIdx, rivalName, rivalBid}] — active bid wars on scripts
  twinFilmWarnings: [],         // [{rivalName, genre, title, monthsUntilRelease}]
  espionageLog: [],             // [{turn, type, rival, result, desc}]
  difficultyScale: 1.0,         // adaptive difficulty multiplier
};

function reducer(state, action) {
  switch (action.type) {

    case 'START_GAME': {
      const scenario = SCENARIOS.find(s => s.id === (action.scenario || 'sandbox')) || SCENARIOS[0];
      const contracts = [
        makeTalent(1, 'director', [35, 55]),
        makeTalent(2, 'actor', [35, 55]),
        makeTalent(3, 'writer', [35, 55]),
        makeTalent(4, 'producer', [35, 55]),
      ];
      const avail = Array.from({ length: 10 }, (_, i) => {
        const types = ['actor', 'director', 'writer', 'producer'];
        return makeTalent(10 + i, pick(types), [25, 90]);
      });
      // Add initial showrunner to available talent
      const showrunner = makeTalent(21, 'showrunner', [30, 50]);
      avail.push(showrunner);
      const spec = SPECIALIZATIONS[action.specialization || 0];
      const startYear = scenario.startYear || 1970;
      const startCash = scenario.startCash || 2000000;
      const startRep = scenario.startRep || 20;
      const startPres = scenario.startPres || 10;
      const scenarioGoal = scenario.goal || null;
      const scenarioDeadline = scenarioGoal ? startYear + scenarioGoal.years : null;
      return {
        ...INIT,
        phase: 'playing',
        studioName: action.name,
        studioColor: action.color || 0,
        specialization: action.specialization || 0,
        studioMotto: action.motto || '',
        year: startYear, month: 1, turn: 0,
        startYear,
        cash: startCash,
        reputation: startRep,
        prestige: startPres,
        contracts,
        availableTalent: avail,
        scripts: [],
        ipMarketplace: generateIPMarketplace(startYear, []),
        ownedIPs: [],
        pendingScreenplays: [],
        competitors: makeCompetitors(startYear),
        genreTrends: makeGenreTrends(startYear),
        cashHistory: [{ turn: 0, year: startYear, month: 1, cash: startCash }],
        activeMovements: getActiveMovements(startYear),
        unlockedTech: ['color_film'], // start with basic tech
        loans: scenario.startLoans || [],
        scenario: scenario.id,
        scenarioGoal,
        scenarioDeadline,
        gameLog: [
          { text: `${action.name} founded in ${startYear} with ${fmt(startCash)} seed funding. ${scenario.goalDesc}`, type: 'info' },
          ...(spec.name !== 'None' ? [{ text: `Studio specialization: ${spec.name} — ${spec.desc}`, type: 'info' }] : []),
        ],
        nextId: 100,
      };
    }

    case 'BID_SCRIPT': {
      const script = state.scripts[action.idx];
      if (!script || !script.isHot) return state;
      const bidAmount = action.amount || script.bidPrice;
      if (state.cash < bidAmount) return { ...state, errorMsg: `Need ${fmt(bidAmount)} to enter bidding.` };
      const bidRivals = (state.competitors || []).filter(c => c.cash > bidAmount * 0.5).slice(0, 3);
      if (bidRivals.length === 0) {
        return { ...state, cash: state.cash - bidAmount,
          devScriptIdx: action.idx, devBudgetM: Math.round((script.budgetMin + script.budgetMax) / 2), devMarketingM: 0,
          devDirectorId: state.contracts.find(t => t.type === 'director')?.id ?? null,
          devActorId: state.contracts.find(t => t.type === 'actor')?.id ?? null,
          devSupporting1Id: null, devSupporting2Id: null, devEnsembleId: null,
          devWriterId: state.contracts.find(t => t.type === 'writer')?.id ?? null,
          devProducerId: state.contracts.find(t => t.type === 'producer')?.id ?? null,
          devFilmType: 'original', devGenre2: script.genre2 || null, devTone: 'serious', devThemes: [],
          devPostProdChoice: 'standard_edit',
          gameLog: [...state.gameLog, { text: `Acquired "${script.title}" for ${fmt(bidAmount)} — no competition!`, type: 'success' }], errorMsg: '' };
      }
      return { ...state, activeBidding: {
        type: 'script', target: { name: `"${script.title}" (${script.genre})`, baseValue: script.bidPrice, scriptIdx: action.idx },
        playerBid: bidAmount,
        rivals: bidRivals.map(r => ({ name: r.name, bid: Math.round(bidAmount * (0.85 + Math.random() * 0.3)), personality: getBiddingPersonality(r), folded: false, cash: r.cash })),
        round: 1, maxRounds: 5, status: 'active', history: [{ round: 1, event: `Bidding opens for "${script.title}"!` }] }, errorMsg: '' };
    }

    case 'SELECT_SCRIPT':
      if (action.idx < 0 || action.idx >= state.scripts.length) return { ...state, devScriptIdx: -1, errorMsg: '' };
      return {
        ...state,
        devScriptIdx: action.idx,
        devBudgetM: Math.round((state.scripts[action.idx].budgetMin + state.scripts[action.idx].budgetMax) / 2),
        devMarketingM: 0,
        devDirectorId: state.contracts.find(t => t.type === 'director')?.id ?? null,
        devActorId: state.contracts.find(t => t.type === 'actor')?.id ?? null,
        devSupporting1Id: null,
        devSupporting2Id: null,
        devEnsembleId: null,
        devWriterId: state.contracts.find(t => t.type === 'writer')?.id ?? null,
        devProducerId: state.contracts.find(t => t.type === 'producer')?.id ?? null,
        devFilmType: 'original',
        devAdaptation: null,
        devFranchiseId: null,
        devGenre2: state.scripts[action.idx].genre2 || null,
        devTone: 'serious',
        devThemes: [],
        devBudgetAlloc: { cast: 20, vfx: 20, production: 20, music: 20, editing: 20 },
        devStudioControl: 50,
        devMarketingPhases: [],
        devInvestor: null,
        devInsured: false,
        devPostProdChoice: 'standard_edit',
        errorMsg: '',
      };

    case 'CANCEL_SCRIPT':
      return { ...state, devScriptIdx: -1, devFilmType: 'original', devAdaptation: null, devFranchiseId: null, devGenre2: null, devTone: 'serious', devRating: 'PG-13', devThemes: [], devBudgetAlloc: { cast: 20, vfx: 20, production: 20, music: 20, editing: 20 }, devStudioControl: 50, devMarketingPhases: [], devInvestor: null, devInsured: false, devSupporting1Id: null, devSupporting2Id: null, devEnsembleId: null, devPostProdChoice: 'standard_edit', devMode: 'browse', customScriptGenre: null, customScriptGenre2: null, customScriptTitle: '', customScriptLogline: '', customScriptWriterId: null, errorMsg: '' };

    case 'SET_DEV_MODE':
      return { ...state, devMode: action.mode, errorMsg: '' };

    case 'SET_IP_FILTER':
      return { ...state, ipFilterCategory: action.category };

    case 'SET_SCREENPLAY_FIELD':
      return { ...state, [action.key]: action.value, errorMsg: '' };

    case 'PURCHASE_IP': {
      const ipIdx = action.idx;
      const ip = state.ipMarketplace[ipIdx];
      if (!ip) return state;
      if (state.cash < ip.price) return { ...state, errorMsg: `Need ${fmt(ip.price)} to acquire "${ip.name}".` };
      const cat = IP_CATEGORIES[ip.category] || IP_CATEGORIES.novel;
      const owned = {
        ...ip,
        purchasePrice: ip.price,
        purchaseYear: state.year,
        purchaseMonth: state.month,
        developed: false,
      };

      // Add newspaper headline for IP acquisition
      const newspaperEdition = (state.newspaperEdition || 0) + 1;
      const dealSize = ip.price > 20e6 ? 'blockbuster' : 'strategic';
      const newspaper = makeNewspaper('ip_purchase', {
        studio: state.studioName,
        ipName: ip.name,
        ipCategory: cat.name.toLowerCase(),
        price: fmt(ip.price),
        dealSize: dealSize,
        recognition: ip.recognition
      }, state.year, state.month, newspaperEdition);

      return {
        ...state,
        cash: state.cash - ip.price,
        ownedIPs: [...state.ownedIPs, owned],
        ipMarketplace: state.ipMarketplace.filter((_, i) => i !== ipIdx),
        newspaperEdition: newspaperEdition,
        newspaperQueue: [...(state.newspaperQueue || []), newspaper].filter(Boolean),
        gameLog: [...state.gameLog, { text: `Acquired IP: "${ip.name}" (${cat.name}) for ${fmt(ip.price)}. Recognition: ${ip.recognition}%.`, type: 'success' }],
        errorMsg: '',
      };
    }

    case 'DEVELOP_IP': {
      const ipIdx = action.idx;
      const ip = state.ownedIPs[ipIdx];
      if (!ip) return state;
      const cat = IP_CATEGORIES[ip.category] || IP_CATEGORIES.novel;
      const [budMin, budMax] = getEraBudgetRange(state.year);
      const script = {
        id: state.nextId,
        genre: ip.genre,
        genre2: null,
        title: ip.name,
        logline: ip.desc,
        budgetMin: budMin,
        budgetMax: budMax,
        marketFit: ip.marketFit || Math.round(50 + ip.recognition * 0.35),
        isIP: true,
        ipCategory: ip.category,
        ipRecognition: ip.recognition,
        ipAudience: ip.audience,
        ipSequelPotential: ip.sequelPotential,
        purchasePrice: ip.purchasePrice || 0,
      };
      return {
        ...state,
        scripts: [...state.scripts, script],
        ownedIPs: state.ownedIPs.map((o, i) => i === ipIdx ? { ...o, developed: true } : o),
        devScriptIdx: state.scripts.length,
        devBudgetM: Math.round((budMin + budMax) / 2),
        devMarketingM: 0,
        devDirectorId: state.contracts.find(t => t.type === 'director')?.id ?? null,
        devActorId: state.contracts.find(t => t.type === 'actor')?.id ?? null,
        devSupporting1Id: null, devSupporting2Id: null, devEnsembleId: null,
        devWriterId: state.contracts.find(t => t.type === 'writer')?.id ?? null,
        devProducerId: state.contracts.find(t => t.type === 'producer')?.id ?? null,
        devFilmType: ip.category === 'remake' ? 'reboot' : 'adaptation',
        devAdaptation: null,
        devFranchiseId: null,
        devGenre2: null,
        devTone: 'serious',
        devThemes: [],
        devBudgetAlloc: { cast: 20, vfx: 20, production: 20, music: 20, editing: 20 },
        devStudioControl: 50,
        devMarketingPhases: [],
        devInvestor: null,
        devInsured: false,
        devPostProdChoice: 'standard_edit',
        devMode: 'configure',
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `"${ip.name}" IP moved to development. Configure your production team.`, type: 'info' }],
        errorMsg: '',
      };
    }

    case 'COMMISSION_SCREENPLAY': {
      const csGenre = state.customScriptGenre;
      const csTitle = state.customScriptTitle || '';
      const csLogline = state.customScriptLogline || '';
      const csWriterId = state.customScriptWriterId;
      const csBudget = (state.screenplayBudget || 1) * 1e6;
      const csTurns = state.screenplayTurns || 2;
      if (!csGenre) return { ...state, errorMsg: 'Pick a genre for your screenplay.' };
      if (!csTitle.trim()) return { ...state, errorMsg: 'Give your screenplay a title.' };
      if (!csLogline.trim()) return { ...state, errorMsg: 'Write a logline for your screenplay.' };
      const csWriter = state.contracts.find(t => t.id === csWriterId);
      if (!csWriter) return { ...state, errorMsg: 'Assign a writer to develop the screenplay.' };
      const totalCost = Math.round(csWriter.salary * 0.3 + csBudget);
      if (state.cash < totalCost) return { ...state, errorMsg: `Need ${fmt(totalCost)} to commission this screenplay.` };
      const [budMin, budMax] = getEraBudgetRange(state.year);
      const pendingScript = {
        genre: csGenre,
        genre2: state.customScriptGenre2 || null,
        title: csTitle.trim(),
        logline: csLogline.trim(),
        budgetMin: budMin,
        budgetMax: budMax,
        devBudget: csBudget,
        writerName: csWriter.name,
        writerId: csWriter.id,
        writerSkill: csWriter.skill,
        writerGenreBonus: csWriter.genreBonus,
        turnsLeft: csTurns,
        isOriginal: true,
      };
      return {
        ...state,
        cash: state.cash - totalCost,
        pendingScreenplays: [...(state.pendingScreenplays || []), pendingScript],
        devMode: 'browse',
        customScriptGenre: null,
        customScriptGenre2: null,
        customScriptTitle: '',
        customScriptLogline: '',
        customScriptWriterId: null,
        screenplayBudget: 1,
        screenplayTurns: 2,
        errorMsg: '',
        gameLog: [...state.gameLog, { text: `Commissioned "${pendingScript.title}" (${pendingScript.genre}) from ${csWriter.name}. Budget: ${fmt(totalCost)}. Delivery in ${csTurns} months.`, type: 'info' }],
      };
    }

    case 'TEST_SCREEN': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || film.status !== 'completed') return { ...state, errorMsg: 'Film must be completed to test screen.' };
      if (film.testScreened) return { ...state, errorMsg: 'Already test screened this film.' };
      const option = TEST_SCREENING_OPTIONS.find(o => o.id === action.optionId);
      if (!option) return state;
      if (state.cash < option.cost) return { ...state, errorMsg: `Need ${fmt(option.cost)} for ${option.name}.` };
      // Generate preview scores with accuracy-based noise
      const noise = (1 - option.accuracy) * 30;
      const previewAudience = clamp(Math.round((film.quality * 0.8 + Math.random() * 20) + (Math.random() - 0.5) * noise), 10, 100);
      const previewCritic = clamp(Math.round(film.quality + (Math.random() - 0.5) * noise), 10, 100);
      const sentiment = previewAudience >= 75 ? 'Very Positive' : previewAudience >= 60 ? 'Positive' : previewAudience >= 45 ? 'Mixed' : previewAudience >= 30 ? 'Negative' : 'Very Negative';
      return {
        ...state,
        cash: state.cash - option.cost,
        films: state.films.map(f => f.id === action.filmId ? {
          ...f, testScreened: true, testScreenData: { audience: previewAudience, critic: previewCritic, sentiment, method: option.name },
        } : f),
        gameLog: [...state.gameLog, { text: `${option.name} for "${film.title}": Audience ${sentiment} (${previewAudience}/100). Critics estimate: ${previewCritic}/100.`, type: previewAudience >= 60 ? 'success' : 'warning' }],
        errorMsg: '',
      };
    }

    case 'RESHOOT': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || film.status !== 'completed') return { ...state, errorMsg: 'Film must be completed to reshoot.' };
      const reshoot = RESHOOT_OPTIONS.find(r => r.id === action.reshootId);
      if (!reshoot) return state;
      const cost = Math.round(film.budget * reshoot.costPct);
      if (state.cash < cost) return { ...state, errorMsg: `Need ${fmt(cost)} for ${reshoot.name}.` };
      const qualityGain = randInt(reshoot.qualityRange[0], reshoot.qualityRange[1]);
      return {
        ...state,
        cash: state.cash - cost,
        films: state.films.map(f => f.id === action.filmId ? {
          ...f,
          status: 'postproduction',
          turnsInStatus: 0,
          turnsNeeded: reshoot.months,
          quality: clamp((f.quality || 50) + qualityGain, 5, 98),
          testScreened: false,
          events: [...f.events, `${reshoot.name}: +${qualityGain}q, -${fmt(cost)}, +${reshoot.months}mo`],
        } : f),
        gameLog: [...state.gameLog, { text: `${reshoot.name} ordered for "${film.title}": +${qualityGain} quality, cost ${fmt(cost)}, back to post-production for ${reshoot.months} month(s).`, type: 'info' }],
        errorMsg: '',
      };
    }

    case 'SET_AWARDS_CAMPAIGN': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || film.status !== 'released') return state;
      const amount = Math.max(0, Math.min(action.amount, state.cash));
      const prev = state.awardsCampaigns[film.id] || 0;
      const diff = amount - prev;
      return {
        ...state,
        cash: state.cash - diff,
        awardsCampaigns: { ...state.awardsCampaigns, [film.id]: amount },
        errorMsg: '',
      };
    }

    case 'BUILD_LOT': {
      const lot = STUDIO_LOTS.find(l => l.id === action.lotId);
      if (!lot) return state;
      if (state.cash < lot.cost) return { ...state, errorMsg: `Need ${fmt(lot.cost)} to build ${lot.name}.` };
      return {
        ...state,
        cash: state.cash - lot.cost,
        studioLots: [...state.studioLots, { id: lot.id, name: lot.name, inUse: false }],
        gameLog: [...state.gameLog, { text: `Built ${lot.name} on the studio lot! Cost: ${fmt(lot.cost)}. Upkeep: ${fmt(lot.monthlyUpkeep)}/mo.`, type: 'success' }],
        errorMsg: '',
      };
    }

    case 'REMASTER_FILM': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || film.status !== 'released') return { ...state, errorMsg: 'Film must be released to remaster.' };
      const format = REMASTER_FORMATS.find(r => r.id === action.formatId);
      if (!format) return state;
      if (state.year < format.minYear || state.year > format.maxYear) return { ...state, errorMsg: `${format.name} not available in ${state.year}.` };
      if ((film.quality || 0) < format.qualityReq) return { ...state, errorMsg: `Need quality ${format.qualityReq}+ for ${format.name}.` };
      if (state.cash < format.cost) return { ...state, errorMsg: `Need ${fmt(format.cost)} for ${format.name}.` };
      const remasters = film.remasters || [];
      if (remasters.includes(format.id)) return { ...state, errorMsg: `Already remastered as ${format.name}.` };
      const remasterRevenue = Math.round((film.totalGross || 0) * format.revenueMult);
      return {
        ...state,
        cash: state.cash - format.cost + remasterRevenue,
        films: state.films.map(f => f.id === action.filmId ? {
          ...f,
          remasters: [...(f.remasters || []), format.id],
          licensingRevenue: (f.licensingRevenue || 0) + remasterRevenue,
          events: [...(f.events || []), `${format.name}: +${fmt(remasterRevenue)}`],
        } : f),
        gameLog: [...state.gameLog, { text: `${format.name} of "${film.title}" earned ${fmt(remasterRevenue)}! Cost: ${fmt(format.cost)}.`, type: 'success' }],
        errorMsg: '',
      };
    }

    case 'SET_DEV': return { ...state, [action.key]: action.value, errorMsg: '' };

    case 'DISMISS_YEAR_SUMMARY':
      return { ...state, showYearSummary: false, pendingYearSummary: null };

    case 'GREENLIGHT': {
      const script = state.scripts[state.devScriptIdx];
      if (!script) return state;
      const dir = state.contracts.find(t => t.id === state.devDirectorId);
      const act = state.contracts.find(t => t.id === state.devActorId);
      const wri = state.contracts.find(t => t.id === state.devWriterId);
      if (!dir || !act || !wri) return { ...state, errorMsg: 'Assign a director, actor, and writer.' };

      // Validate talent demands
      const allTalent = [dir, act, wri];
      for (const t of allTalent) {
        if (!t.demands) continue;
        for (const d of t.demands) {
          if (d.type === 'genre_refuse' && d.genres.includes(script.genre)) {
            return { ...state, errorMsg: `${t.name} refuses to work on ${script.genre} films.` };
          }
          if (d.type === 'director_pref' && t.type !== 'director' && dir.id !== d.directorId) {
            return { ...state, errorMsg: `${t.name} wants to work with ${d.directorName}.` };
          }
          if (d.type === 'budget_min' && state.devBudgetM * 1e6 < d.amount) {
            return { ...state, errorMsg: `${t.name} only works on films with $${Math.round(d.amount/1e6)}M+ budgets.` };
          }
          if (d.type === 'creative_control' && state.devStudioControl > d.maxStudioControl) {
            return { ...state, errorMsg: `${t.name} demands studio control be under ${d.maxStudioControl}%.` };
          }
          if (d.type === 'no_sequels' && state.devFilmType === 'sequel') {
            return { ...state, errorMsg: `${t.name} refuses to do sequels.` };
          }
          if (d.type === 'top_billing') {
            const others = allTalent.filter(o => o.id !== t.id);
            if (others.some(o => o.salary > t.salary)) {
              return { ...state, errorMsg: `${t.name} demands top billing (highest salary).` };
            }
          }
        }
      }

      // Check for industry crises blocking production
      const crises = state.activeCrises || [];
      const writersStrike = crises.find(c => c.effects.blockScripts);
      if (writersStrike) return { ...state, errorMsg: `${writersStrike.name} in progress! Cannot develop new films.` };
      const actorsStrike = crises.find(c => c.effects.blockProduction);
      if (actorsStrike) return { ...state, errorMsg: `${actorsStrike.name} in progress! Cannot start new productions.` };

      let budget = state.devBudgetM * 1e6;
      let marketing = state.devMarketingM * 1e6;
      let adaptationCost = 0;
      let qualityBonus = 0;
      let marketingMultiplier = 1;
      let title = script.title;
      let franchiseId = null;
      let sequelNumber = null;
      let adaptationName = null;
      let filmTypeToUse = state.devFilmType;

      // If script is from IP and filmType is still 'original', set to 'adaptation'
      if (script.isIP && state.devFilmType === 'original') {
        filmTypeToUse = 'adaptation';
      }

      // Handle film types
      if (filmTypeToUse === 'sequel' && state.devFranchiseId !== null) {
        const franchise = state.franchises.find(f => f.id === state.devFranchiseId);
        if (franchise) {
          sequelNumber = franchise.filmIds.length + 1;
          title = script.title + ' ' + sequelNumber;
          // IP sequels decay slower: use -2 instead of -3 per sequel
          if (franchise.ipBased) {
            qualityBonus = -2 * (sequelNumber - 1); // IP sequels: 2nd: -2, 3rd: -4, etc
          } else {
            qualityBonus = -3 * (sequelNumber - 1); // 2nd: -3, 3rd: -6, etc
          }
          franchiseId = state.devFranchiseId;
          budget = budget * 1.1; // 10% marketing boost for sequels
          marketingMultiplier = 1.15;
        }
      } else if (filmTypeToUse === 'reboot' && state.devFranchiseId !== null) {
        const franchise = state.franchises.find(f => f.id === state.devFranchiseId);
        if (franchise && franchise.filmIds.length >= 3) {
          title = 'Reboot: ' + script.title;
          budget = budget * 1.5; // 50% cost increase
          qualityBonus = 0; // Resets quality decay
          franchiseId = state.devFranchiseId;
          marketingMultiplier = 1.2;
        }
      } else if (filmTypeToUse === 'adaptation' && state.devAdaptation !== null) {
        const adapt = ADAPTATIONS[state.devAdaptation];
        if (adapt) {
          adaptationCost = adapt.cost;
          qualityBonus = adapt.qualityBonus;
          marketingMultiplier = 1 + adapt.marketingBonus;
          adaptationName = adapt.name;
        }
      }

      // Apply filming location cost multiplier
      const filmLoc = FILMING_LOCATIONS.find(l => l.id === (state.devLocation || 'hollywood'));
      if (filmLoc) budget = Math.round(budget * filmLoc.costMult);

      // Apply tech consortium VFX discount
      const techCoal = state.playerCoalition ? INDUSTRY_COALITIONS.find(c => c.id === state.playerCoalition) : null;
      const isVFXHeavy = ['Sci-Fi', 'Action', 'Fantasy', 'Animation'].includes(script.genre);
      if (techCoal?.effect?.techDiscount && isVFXHeavy) {
        budget = Math.round(budget * (1 - techCoal.effect.techDiscount));
      }

      // Apply era and zeitgeist budget multipliers
      const era = getCurrentFilmEra(state.year);
      const eraBudgetMult = era.budgetMult || 1.0;
      const zeitgeistBudgetMult = (state.activeZeitgeist || []).reduce((m, z) => m * (z.budgetInflation || 1.0), 1.0);
      budget = Math.round(budget * eraBudgetMult * zeitgeistBudgetMult);
      marketing = Math.round(marketing * zeitgeistBudgetMult); // Zeitgeist affects marketing too

      // Apply co-production cost sharing
      const activeCoProd = state.coProductions.find(cp => cp.active);
      let totalCost = budget + marketing + adaptationCost;
      if (activeCoProd) totalCost = Math.round(totalCost * activeCoProd.costShare);

      // Apply investor financing
      let investorId = null;
      if (state.devInvestor) {
        const investor = INVESTOR_TYPES.find(i => i.id === state.devInvestor);
        if (investor && budget >= investor.minBudget && budget <= investor.maxBudget) {
          const investorFunding = Math.round(budget * investor.fundPct);
          totalCost -= investorFunding;
          investorId = state.devInvestor;
        }
      }

      // Apply insurance cost (6% of budget)
      let isInsured = false;
      if (state.devInsured) {
        const insuranceCost = Math.round(budget * 0.06);
        totalCost += insuranceCost;
        isInsured = true;
      }

      if (state.cash < totalCost) return { ...state, errorMsg: `Need ${fmt(totalCost)} but you only have ${fmt(state.cash)}.` };

      // Production pipeline phase turns
      const budgetM = budget / 1e6;
      let scriptDevTurns = (wri.traitEffect && wri.traitEffect.devSpeed) ? 0 : 1;
      let preProductionTurns = 1;
      let photographyTurns = budgetM >= 150 ? 4 : budgetM >= 75 ? 3 : 2;
      if (dir.traitEffect && dir.traitEffect.speedBonus) photographyTurns = Math.max(2, photographyTurns - dir.traitEffect.speedBonus);
      if (state.facilitiesLevel >= 4) photographyTurns = Math.max(1, photographyTurns - 1);
      let postProdTurns = budgetM >= 100 ? 3 : 2;
      let marketingTurns = 1;
      const totalProdTurns = scriptDevTurns + preProductionTurns + photographyTurns + postProdTurns + marketingTurns;

      const prod = state.contracts.find(t => t.id === state.devProducerId) || null;

      // Build cast members array (multi-casting)
      const castMembers = [];
      const talentSnapshot = (t, roleId) => ({ id: t.id, name: t.name, skill: t.skill, popularity: t.popularity || 0, genreBonus: t.genreBonus, trait: t.trait, traitDesc: t.traitDesc, traitEffect: t.traitEffect, profitParticipation: t.profitParticipation || 0, role: roleId });
      castMembers.push(talentSnapshot(act, 'lead'));
      const sup1 = state.contracts.find(t => t.id === state.devSupporting1Id);
      if (sup1) castMembers.push(talentSnapshot(sup1, 'supporting1'));
      const sup2 = state.contracts.find(t => t.id === state.devSupporting2Id);
      if (sup2) castMembers.push(talentSnapshot(sup2, 'supporting2'));
      const ens = state.contracts.find(t => t.id === state.devEnsembleId);
      if (ens) castMembers.push(talentSnapshot(ens, 'ensemble'));

      const film = {
        id: state.nextId,
        title, genre: script.genre, genre2: state.devGenre2, logline: script.logline,
        budget, marketing,
        director: { id: dir.id, name: dir.name, skill: dir.skill, genreBonus: dir.genreBonus, trait: dir.trait, traitDesc: dir.traitDesc, traitEffect: dir.traitEffect, profitParticipation: dir.profitParticipation || 0 },
        actor: { id: act.id, name: act.name, skill: act.skill, popularity: act.popularity, genreBonus: act.genreBonus, trait: act.trait, traitDesc: act.traitDesc, traitEffect: act.traitEffect, profitParticipation: act.profitParticipation || 0 },
        castMembers, // NEW: full cast with roles
        writer: { id: wri.id, name: wri.name, skill: wri.skill, genreBonus: wri.genreBonus, trait: wri.trait, traitDesc: wri.traitDesc, traitEffect: wri.traitEffect, profitParticipation: wri.profitParticipation || 0 },
        producer: prod ? { id: prod.id, name: prod.name, skill: prod.skill, trait: prod.trait, traitDesc: prod.traitDesc, traitEffect: prod.traitEffect, profitParticipation: prod.profitParticipation || 0 } : null,
        // Production pipeline
        status: 'script_dev',
        productionPhase: 'script_dev',
        turnsInStatus: 0,
        turnsNeeded: scriptDevTurns,
        phaseTurns: { script_dev: scriptDevTurns, pre_production: preProductionTurns, principal_photography: photographyTurns, post_production: postProdTurns, marketing_campaign: marketingTurns },
        totalProdTurns,
        postProdChoice: state.devPostProdChoice || 'standard_edit',
        productionEvents: [], // events that happen during filming
        _scriptQuality: 0, // accumulated quality from script phase
        _filmingQuality: 0, // accumulated quality from filming events
        _postProdQuality: 0, // accumulated quality from post-production
        quality: null, criticScore: null, audienceScore: null,
        domestic: null, international: null, totalGross: null, profit: null,
        releasedYear: null, releasedMonth: null,
        events: [],
        franchiseId,
        filmType: filmTypeToUse,
        adaptationName,
        sequelNumber,
        _qualityBonus: qualityBonus,
        _marketingMult: marketingMultiplier,
        _specBonus: SPECIALIZATIONS[state.specialization]?.bonus || {},
        location: state.devLocation || 'hollywood',
        tone: state.devTone,
        targetRating: state.devRating,
        themes: [...state.devThemes],
        budgetAlloc: { ...state.devBudgetAlloc },
        studioControl: state.devStudioControl,
        marketingPhases: [...state.devMarketingPhases],
        rating: null,
        theatricalRun: null,
        licensingRevenue: 0,
        rewrites: [],
        soldRights: false,
        investor: investorId,
        insured: isInsured,
        targetReleaseMonth: state.devReleaseMonth,
        _eraQualityMod: era.qualityMod || 0,
        _eraId: era.id,
        _eraBudgetMult: eraBudgetMult,
        isSleeper: false, // will be set on release if qualifies
        // IP metadata
        isIP: script.isIP || false,
        ipCategory: script.ipCategory || null,
        ipRecognition: script.ipRecognition || 0,
        ipAudience: script.ipAudience || null,
        ipSequelPotential: script.ipSequelPotential || false,
        isOriginal: script.isOriginal || false,
      };

      const playerCoalition = state.playerCoalition ? INDUSTRY_COALITIONS.find(c => c.id === state.playerCoalition) : null;
      if (playerCoalition?.effect?.qualityMod) film._coalitionQualityMod = playerCoalition.effect.qualityMod;

      let updatedFranchises = state.franchises;
      if (filmTypeToUse === 'sequel' && franchiseId !== null) {
        updatedFranchises = state.franchises.map(f =>
          f.id === franchiseId ? { ...f, filmIds: [...f.filmIds, film.id] } : f
        );
      }

      // Auto-create franchise for IP films with sequel potential
      if (script.ipSequelPotential && filmTypeToUse !== 'sequel' && !franchiseId) {
        const existingFranchise = updatedFranchises.find(f => f.ipBased && f.ipCategory === script.ipCategory && f.name === film.title);
        if (!existingFranchise) {
          const newFranchise = {
            id: state.nextId + 1,
            name: film.title,
            filmIds: [film.id],
            genre: film.genre,
            ipBased: true,
            ipCategory: script.ipCategory || null,
          };
          updatedFranchises = [...updatedFranchises, newFranchise];
          film.franchiseId = newFranchise.id;
        }
      }

      return {
        ...state,
        films: [...state.films, film],
        franchises: updatedFranchises,
        cash: state.cash - totalCost,
        nextId: state.nextId + 1,
        devScriptIdx: -1,
        devFilmType: 'original',
        devAdaptation: null,
        devFranchiseId: null,
        devGenre2: null,
        devTone: 'serious',
        devRating: 'PG-13',
        devInvestor: null,
        devInsured: false,
        devSupporting1Id: null,
        devSupporting2Id: null,
        devEnsembleId: null,
        devPostProdChoice: 'standard_edit',
        errorMsg: '',
        gameLog: [...state.gameLog, { text: `Greenlighted "${film.title}" (${film.genre}, ${filmTypeToUse}) — Budget: ${fmt(budget)}, Marketing: ${fmt(marketing)}${adaptationCost > 0 ? ', IP: ' + fmt(adaptationCost) : ''}`, type: 'success' }],
      };
    }

    case 'REWRITE_SCRIPT': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || !['production', 'script_dev', 'pre_production', 'principal_photography'].includes(film.status)) return { ...state, errorMsg: 'Film must be in production to rewrite.' };
      const rewriteType = REWRITE_TYPES.find(r => r.id === action.rewriteId);
      if (!rewriteType) return { ...state, errorMsg: 'Invalid rewrite type.' };
      // Check max uses for this rewrite type on this film
      const prevRewrites = film.rewrites || [];
      const usesOfType = prevRewrites.filter(r => r === rewriteType.id).length;
      if (usesOfType >= rewriteType.maxUses) return { ...state, errorMsg: `Already used ${rewriteType.name} the maximum ${rewriteType.maxUses} time(s).` };
      const cost = Math.round(film.budget * rewriteType.costPct);
      if (state.cash < cost) return { ...state, errorMsg: `Need ${fmt(cost)} for ${rewriteType.name}.` };
      // Diminishing returns: each total rewrite reduces effectiveness by 20%
      const totalRewrites = prevRewrites.length;
      const diminishing = Math.max(0.3, 1 - totalRewrites * 0.2);
      // Writer skill bonus: better writers extract more from rewrites
      const writer = state.contracts.find(t => t.id === film.writer?.id);
      const writerMod = writer ? 0.7 + (writer.skill / 100) * 0.6 : 0.8; // 0.7-1.3x based on skill
      // Genre bonus for comedy punch-up
      const genreMod = (rewriteType.genreBonus && rewriteType.genreBonus.includes(film.genre)) ? 1.4 : 1.0;
      const qualityGain = Math.round((rewriteType.qualityMin + Math.random() * (rewriteType.qualityMax - rewriteType.qualityMin)) * diminishing * writerMod * genreMod);
      return {
        ...state,
        cash: state.cash - cost,
        films: state.films.map(f => f.id === action.filmId ? {
          ...f,
          turnsNeeded: f.turnsNeeded + rewriteType.months,
          _qualityBoost: (f._qualityBoost || 0) + qualityGain,
          rewrites: [...prevRewrites, rewriteType.id],
          events: [...f.events, `${rewriteType.name}: +${qualityGain}q${rewriteType.months > 0 ? `, +${rewriteType.months}mo` : ''}, -${fmt(cost)}`],
        } : f),
        gameLog: [...state.gameLog, { text: `${rewriteType.name} on "${film.title}" — +${qualityGain} quality${rewriteType.months > 0 ? `, +${rewriteType.months} month(s)` : ''}, cost: ${fmt(cost)}.`, type: 'info' }],
      };
    }

    case 'SIGN_TALENT': {
      const t = state.availableTalent.find(x => x.id === action.id);
      if (!t) return state;
      return {
        ...state,
        contracts: [...state.contracts, t],
        availableTalent: state.availableTalent.filter(x => x.id !== action.id),
      };
    }

    case 'RELEASE_TALENT': {
      return { ...state, contracts: state.contracts.filter(t => t.id !== action.id) };
    }

    case 'UPGRADE_FACILITIES': {
      const costs = [0, 500000, 2000000, 5000000, 15000000, 50000000];
      const next = state.facilitiesLevel + 1;
      if (next > 5 || state.cash < costs[next]) return state;
      return {
        ...state,
        facilitiesLevel: next,
        cash: state.cash - costs[next],
        gameLog: [...state.gameLog, { text: `Facilities upgraded to Level ${next}!`, type: 'success' }],
      };
    }

    case 'LAUNCH_STREAMING': {
      if (state.year < 2005) return { ...state, errorMsg: 'Streaming technology is not available yet. Come back after 2005.' };
      if (state.cash < 100e6) return { ...state, errorMsg: 'Need $100M to launch a streaming platform.' };
      if (state.streamingPlatform) return { ...state, errorMsg: 'Already have a streaming platform!' };
      // Back catalog: all released films are automatically in the streaming library
      const backCatalog = state.films.filter(f => f.status === 'released').map(f => f.id);
      const platform = {
        name: state._streamingName || `${state.studioName}+`,
        subscribers: 0,
        tier: state._streamingTier || 'standard',
        adTier: false,
        contentLibrary: backCatalog.length,
        tvContentCount: 0,
        launchYear: state.year,
        monthlyRevenue: 0,
        churnRate: STREAMING_TIERS.find(t => t.id === (state._streamingTier || 'standard'))?.churnRate || 0.04,
        licensedInContent: 0,
        marketingSpend: 0,
        catalogFilmIds: backCatalog, // track which films are on platform
        catalogShowIds: [],          // track which TV shows are on platform
      };
      // Rival streamers that exist by this year
      const activeRivals = RIVAL_STREAMERS.filter(s => s.founded <= state.year).map(s => ({
        ...s,
        subscribers: Math.round(s.baseSubscribers * (0.5 + Math.random() * 0.6) * Math.min(1, (state.year - s.founded + 1) / 5)),
        contentCount: randInt(20, 150) + (state.year - s.founded) * 15,
        quality: randInt(50, 80),
      }));
      return {
        ...state,
        cash: state.cash - 100e6,
        streamingPlatform: platform,
        rivalStreamers: activeRivals,
        gameLog: [...state.gameLog, { text: `Launched streaming platform "${platform.name}"! Invested $100M. ${backCatalog.length} films from your back catalog added to the library.`, type: 'success' }],
        errorMsg: '',
        _streamingName: '',
        _streamingTier: 'standard',
        newspaperEdition: (state.newspaperEdition || 0) + 1,
        newspaperQueue: [...(state.newspaperQueue || []), makeNewspaper('streaming_launch', { studio: state.studioName }, state.year, state.month, (state.newspaperEdition || 0) + 1)].filter(Boolean),
      };
    }

    case 'SET_STREAMING_TIER': {
      if (!state.streamingPlatform) return state;
      const tier = STREAMING_TIERS.find(t => t.id === action.tier);
      if (!tier) return state;
      return {
        ...state,
        streamingPlatform: { ...state.streamingPlatform, tier: action.tier, churnRate: tier.churnRate },
        gameLog: [...state.gameLog, { text: `Streaming tier changed to ${tier.name} ($${tier.monthlyPrice}/mo).`, type: 'info' }],
      };
    }

    case 'TOGGLE_AD_TIER': {
      if (!state.streamingPlatform) return state;
      return {
        ...state,
        streamingPlatform: { ...state.streamingPlatform, adTier: !state.streamingPlatform.adTier },
      };
    }

    case 'STREAMING_MARKETING': {
      if (!state.streamingPlatform) return state;
      const spend = action.amount || 5e6;
      if (state.cash < spend) return { ...state, errorMsg: 'Not enough cash for streaming marketing.' };
      return {
        ...state,
        cash: state.cash - spend,
        streamingPlatform: { ...state.streamingPlatform, marketingSpend: (state.streamingPlatform.marketingSpend || 0) + spend },
        gameLog: [...state.gameLog, { text: `Spent ${fmt(spend)} on streaming platform marketing.`, type: 'info' }],
        errorMsg: '',
      };
    }

    case 'GREENLIGHT_TV': {
      const format = TV_FORMATS.find(f => f.id === state.tvDevFormat);
      if (!format) return { ...state, errorMsg: 'Select a TV format first.' };
      const showrunner = state.contracts.find(t => t.id === state.tvDevShowrunnerId && t.type === 'showrunner');
      if (!showrunner) return { ...state, errorMsg: 'Assign a showrunner first.' };
      const episodes = state.tvDevEpisodes || format.episodesRange[0];
      const costPerEp = (state.tvDevBudgetPerEp || 3) * 1e6;
      const totalCost = episodes * costPerEp;
      if (state.cash < totalCost) return { ...state, errorMsg: `Need ${fmt(totalCost)} to greenlight this show.` };

      const formatName = format.name;
      const titlePool = (gameContent.tvShowTitles && gameContent.tvShowTitles[formatName]) || [];
      const usedTitles = new Set(state.tvShows.map(s => s.title));
      const available = titlePool.filter(t => !usedTitles.has(t.title || t));
      const picked = available.length > 0 ? pick(available) : { title: state.tvDevTitle || `${state.studioName} Series #${state.tvShows.length + 1}`, logline: 'A new show in development.' };
      const title = state.tvDevTitle || (typeof picked === 'object' ? picked.title : picked);

      const show = {
        id: state.nextId,
        title,
        logline: typeof picked === 'object' ? picked.logline : '',
        format: format.id,
        formatName: format.name,
        showrunnerId: showrunner.id,
        showrunnerName: showrunner.name,
        quality: 0,
        seasons: 0,
        currentSeason: 1,
        episodes,
        episodeCost: costPerEp,
        totalCost,
        status: 'development',
        viewership: 0,
        criticScore: 0,
        audienceScore: 0,
        subscriberImpact: 0,
        turnsInStatus: 0,
        turnsNeeded: 2,
        prodTurns: Math.ceil(episodes / 3),
        releaseStrategy: state.tvDevDistribution || 'streaming_exclusive',
        year: state.year,
        events: [],
      };

      return {
        ...state,
        tvShows: [...state.tvShows, show],
        cash: state.cash - totalCost,
        nextId: state.nextId + 1,
        tvDevFormat: null,
        tvDevShowrunnerId: null,
        tvDevTitle: '',
        gameLog: [...state.gameLog, { text: `Greenlit "${title}" (${format.name}, ${episodes} eps, ${fmt(totalCost)})!`, type: 'success' }],
        errorMsg: '',
      };
    }

    case 'SET_TV_DEV': {
      return { ...state, [action.field]: action.value };
    }

    case 'RENEW_SHOW': {
      const show = state.tvShows.find(s => s.id === action.showId);
      if (!show || show.status !== 'airing') return state;
      const format = TV_FORMATS.find(f => f.id === show.format);
      if (format && format.maxSeasons && show.seasons >= format.maxSeasons) return { ...state, errorMsg: 'Limited series cannot be renewed.' };
      const renewCost = show.totalCost * 0.9;
      if (state.cash < renewCost) return { ...state, errorMsg: `Need ${fmt(renewCost)} to renew.` };
      return {
        ...state,
        tvShows: state.tvShows.map(s => s.id === action.showId ? { ...s, status: 'production', currentSeason: s.currentSeason + 1, turnsInStatus: 0, turnsNeeded: Math.ceil(s.episodes / 3), totalCost: s.totalCost + renewCost, events: [...(s.events || []), `Renewed for Season ${s.currentSeason + 1}`] } : s),
        cash: state.cash - renewCost,
        gameLog: [...state.gameLog, { text: `Renewed "${show.title}" for Season ${show.currentSeason + 1}! Cost: ${fmt(renewCost)}`, type: 'success' }],
        errorMsg: '',
      };
    }

    case 'CANCEL_SHOW': {
      const show = state.tvShows.find(s => s.id === action.showId);
      if (!show) return state;
      return {
        ...state,
        tvShows: state.tvShows.map(s => s.id === action.showId ? { ...s, status: 'cancelled' } : s),
        gameLog: [...state.gameLog, { text: `Cancelled "${show.title}" after ${show.seasons} season(s).`, type: 'warning' }],
      };
    }

    case 'LICENSE_CONTENT_OUT': {
      const content = action.contentType === 'film'
        ? state.films.find(f => f.id === action.contentId && f.status === 'released')
        : state.tvShows.find(s => s.id === action.contentId && (s.status === 'airing' || s.status === 'ended'));
      if (!content) return state;
      const monthlyFee = Math.round((content.quality || 50) * 5000 * (action.contentType === 'show' ? 2 : 1));
      const deal = {
        id: state.nextId,
        type: 'out',
        partner: action.partner || pick(RIVAL_STREAMERS).name,
        contentTitle: content.title,
        contentType: action.contentType,
        monthlyFee,
        monthsLeft: 12,
      };
      return {
        ...state,
        licensingDeals: [...(state.licensingDeals || []), deal],
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Licensed "${content.title}" to ${deal.partner} for ${fmt(monthlyFee)}/mo (12 months).`, type: 'success' }],
      };
    }

    case 'LICENSE_CONTENT_IN': {
      if (!state.streamingPlatform) return { ...state, errorMsg: 'Launch a streaming platform first.' };
      const monthlyFee = action.monthlyFee || randInt(50000, 300000);
      const deal = {
        id: state.nextId,
        type: 'in',
        partner: action.partner || 'External Studio',
        contentTitle: action.title || 'Licensed Content Package',
        contentType: 'package',
        monthlyFee,
        monthsLeft: action.months || 12,
        qualityBoost: randInt(3, 10),
      };
      return {
        ...state,
        licensingDeals: [...(state.licensingDeals || []), deal],
        streamingPlatform: { ...state.streamingPlatform, licensedInContent: (state.streamingPlatform.licensedInContent || 0) + 1 },
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Licensed content from ${deal.partner} for ${fmt(monthlyFee)}/mo.`, type: 'info' }],
      };
    }

    case 'SET_WINDOWING': {
      return { ...state, windowingStrategy: action.strategy };
    }

    case 'SET_FILM_DISTRIBUTION': {
      return {
        ...state,
        films: state.films.map(f => f.id === action.filmId ? { ...f, distributionStrategy: action.strategy } : f),
      };
    }

    case 'ADD_TO_CATALOG': {
      // Add a released film or ended show to streaming catalog
      if (!state.streamingPlatform) return { ...state, errorMsg: 'Launch a streaming platform first.' };
      const sp = { ...state.streamingPlatform };
      const catalogFilmIds = [...(sp.catalogFilmIds || [])];
      const catalogShowIds = [...(sp.catalogShowIds || [])];
      if (action.contentType === 'film') {
        if (catalogFilmIds.includes(action.contentId)) return { ...state, errorMsg: 'Already in your catalog.' };
        const film = state.films.find(f => f.id === action.contentId && f.status === 'released');
        if (!film) return state;
        catalogFilmIds.push(action.contentId);
        sp.catalogFilmIds = catalogFilmIds;
        sp.contentLibrary = catalogFilmIds.length + catalogShowIds.length;

        // IP content is more attractive to subscribers
        let subscriberBoost = 0;
        if (film.isIP) {
          subscriberBoost = Math.round((film.quality || 50) * 600 + Math.random() * 25000);
        } else {
          subscriberBoost = Math.round((film.quality || 50) * 500 + Math.random() * 20000);
        }

        return {
          ...state,
          streamingPlatform: { ...sp, subscribers: (sp.subscribers || 0) + subscriberBoost },
          gameLog: [...state.gameLog, { text: `Added "${film.title}" to ${sp.name} catalog${film.isIP ? ` (+${fmt(subscriberBoost)} IP content bonus)` : ''}.`, type: 'info' }]
        };
      } else if (action.contentType === 'show') {
        if (catalogShowIds.includes(action.contentId)) return { ...state, errorMsg: 'Already in your catalog.' };
        const show = state.tvShows.find(s => s.id === action.contentId);
        if (!show) return state;
        catalogShowIds.push(action.contentId);
        sp.catalogShowIds = catalogShowIds;
        sp.contentLibrary = catalogFilmIds.length + catalogShowIds.length;
        return { ...state, streamingPlatform: sp, gameLog: [...state.gameLog, { text: `Added "${show.title}" to ${sp.name} catalog.`, type: 'info' }] };
      }
      return state;
    }

    case 'REMOVE_FROM_CATALOG': {
      if (!state.streamingPlatform) return state;
      const sp2 = { ...state.streamingPlatform };
      if (action.contentType === 'film') {
        sp2.catalogFilmIds = (sp2.catalogFilmIds || []).filter(id => id !== action.contentId);
      } else {
        sp2.catalogShowIds = (sp2.catalogShowIds || []).filter(id => id !== action.contentId);
      }
      sp2.contentLibrary = (sp2.catalogFilmIds || []).length + (sp2.catalogShowIds || []).length;
      return { ...state, streamingPlatform: sp2 };
    }

    case 'SCHEDULE_RELEASE': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || film.status !== 'completed') return state;
      return {
        ...state,
        films: state.films.map(f => f.id === action.filmId ? {
          ...f,
          status: 'scheduled',
          releaseWindow: action.windowId,
          scheduledMonth: action.month,
          scheduledYear: action.year,
        } : f),
        gameLog: [...state.gameLog, {
          text: `"${film.title}" scheduled for release: ${action.windowName} ${action.year}`,
          type: 'info',
        }],
      };
    }

    case 'CREATE_FRANCHISE': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || film.franchiseId !== null) return state;
      if ((film.totalGross || 0) < 100000000) return state;
      const fid = state.nextId;
      const franchise = { id: fid, name: film.title + ' Universe', filmIds: [film.id], totalGross: film.totalGross };
      return {
        ...state,
        franchises: [...state.franchises, franchise],
        films: state.films.map(f => f.id === film.id ? { ...f, franchiseId: fid } : f),
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Created franchise: "${franchise.name}"`, type: 'success' }],
      };
    }

    case 'TAKE_LOAN': {
      const loan = LOAN_OPTIONS[action.idx];
      const creditRating = getCreditRating(state);
      if (!loan || state.loans.length >= creditRating.maxLoans) return { ...state, errorMsg: `Your credit rating only allows ${creditRating.maxLoans} loans.` };
      const eraLoanMod = getEraLoanRates(state.year);
      const adjustedInterestRate = loan.interestRate * creditRating.interestMod * eraLoanMod;
      return {
        ...state,
        cash: state.cash + loan.amount,
        loans: [...state.loans, { ...loan, id: state.nextId, remainingMonths: loan.termMonths, principal: loan.amount, interestRate: adjustedInterestRate }],
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Took out a ${loan.name}: ${fmt(loan.amount)} at ${(adjustedInterestRate * 100).toFixed(1)}% monthly interest (${creditRating.name} rating).`, type: 'info' }],
      };
    }

    case 'REPAY_LOAN': {
      const loan = state.loans.find(l => l.id === action.id);
      if (!loan || state.cash < loan.principal) return state;
      return {
        ...state,
        cash: state.cash - loan.principal,
        loans: state.loans.filter(l => l.id !== action.id),
        gameLog: [...state.gameLog, { text: `Repaid ${loan.name} early (${fmt(loan.principal)}).`, type: 'success' }],
      };
    }

    case 'STOCK_BUYBACK': {
      if (!state.isPublic) return state;
      const cost = Math.round(state.stockPrice * 100000); // buy 100K shares
      if (state.cash < cost) return { ...state, errorMsg: `Need ${fmt(cost)} for buyback.` };
      return {
        ...state,
        cash: state.cash - cost,
        stockPrice: state.stockPrice + Math.round(state.stockPrice * 0.05),
        shareholderDemand: clamp(state.shareholderDemand - 10, 0, 100),
        gameLog: [...state.gameLog, { text: `Stock buyback: spent ${fmt(cost)}, stock +5%.`, type: 'info' }],
      };
    }

    case 'PAY_DIVIDEND': {
      if (!state.isPublic) return state;
      const dividend = Math.round(state.cash * 0.05); // 5% of cash
      if (dividend < 1000000) return { ...state, errorMsg: 'Need at least $1M in cash for dividends.' };
      return {
        ...state,
        cash: state.cash - dividend,
        shareholderDemand: clamp(state.shareholderDemand - 20, 0, 100),
        stockPrice: state.stockPrice + Math.round(state.stockPrice * 0.03),
        gameLog: [...state.gameLog, { text: `Paid ${fmt(dividend)} in dividends. Shareholders pleased. Demand -20.`, type: 'info' }],
      };
    }

    case 'SIGN_DISTRIBUTION': {
      const deal = DISTRIBUTION_DEALS[action.idx];
      if (!deal || state.cash < deal.cost || state.reputation < deal.minRep || state.distributionDeal) return state;
      return {
        ...state,
        cash: state.cash - deal.cost,
        distributionDeal: deal,
        distributionTurnsLeft: deal.duration,
        gameLog: [...state.gameLog, { text: `Signed ${deal.name} distribution deal for ${deal.duration} months.`, type: 'success' }],
      };
    }

    case 'BOOST_MORALE': {
      const cost = 500000;
      if (state.cash < cost) return state;
      return {
        ...state,
        cash: state.cash - cost,
        contracts: state.contracts.map(t => ({ ...t, morale: clamp(t.morale + 10, 0, 100) })),
        gameLog: [...state.gameLog, { text: `Held a studio retreat! All talent morale +10. Cost: ${fmt(cost)}.`, type: 'success' }],
      };
    }

    case 'DISMISS_CEREMONY':
      return { ...state, showCeremony: false };

    // ==================== NEW FEATURE ACTIONS ====================

    case 'SET_LOCATION':
      return { ...state, devLocation: action.locationId };

    case 'SET_TAX_DEDUCTION': {
      const dedId = action.deductionId;
      const has = state.taxDeductions.includes(dedId);
      return {
        ...state,
        taxDeductions: has ? state.taxDeductions.filter(d => d !== dedId) : [...state.taxDeductions, dedId],
      };
    }

    case 'SELL_FILM_RIGHTS': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || film.status !== 'released' || film.soldRights) return { ...state, errorMsg: 'Cannot sell rights for this film.' };
      // Valuation: based on gross, quality, and age
      const age = (state.year - film.releasedYear) * 12 + (state.month - (film.releasedMonth || 1));
      const baseValue = film.totalGross * 0.15;
      const qualityMult = film.quality >= 80 ? 1.5 : film.quality >= 60 ? 1.2 : 1.0;
      const ageMult = Math.max(0.3, 1 - age / 240); // depreciates over 20 years
      const salePrice = Math.round(baseValue * qualityMult * ageMult);
      return {
        ...state,
        cash: state.cash + salePrice,
        films: state.films.map(f => f.id === action.filmId ? { ...f, soldRights: true } : f),
        gameLog: [...state.gameLog, { text: `Sold rights to "${film.title}" for ${fmt(salePrice)}. No more licensing revenue from this film.`, type: 'info' }],
      };
    }

    case 'UNLOCK_TECH': {
      const tech = TECH_TREE.find(t => t.id === action.techId);
      if (!tech || state.unlockedTech.includes(tech.id)) return state;
      if (state.cash < tech.cost) return { ...state, errorMsg: `Not enough cash to unlock ${tech.name}!` };
      if (state.year < tech.year) return { ...state, errorMsg: `${tech.name} is not available until ${tech.year}!` };
      return {
        ...state,
        cash: state.cash - tech.cost,
        unlockedTech: [...state.unlockedTech, tech.id],
        gameLog: [...state.gameLog, { text: `Unlocked ${tech.name}! ${tech.unlocks}`, type: 'success' }],
      };
    }

    case 'SUBMIT_FESTIVAL': {
      const festival = FILM_FESTIVALS.find(f => f.id === action.festivalId);
      const film = state.films.find(f => f.id === action.filmId);
      if (!festival || !film) return state;
      if (film.quality < festival.minQuality) return { ...state, errorMsg: `${film.title} doesn't meet the minimum quality (${festival.minQuality}) for ${festival.name}.` };
      // Check if already submitted this film to this festival
      if (state.festivalSubmissions.some(s => s.filmId === film.id && s.festivalId === festival.id)) return { ...state, errorMsg: 'Already submitted to this festival!' };
      const genreMatch = festival.preferredGenres.includes(film.genre) ? 0.3 : 0;
      const acceptChance = 0.3 + (film.quality / 100) * 0.5 + genreMatch;
      const accepted = Math.random() < acceptChance;
      const won = accepted && Math.random() < (film.quality / 100) * 0.4;
      const submission = { filmId: film.id, festivalId: festival.id, year: state.year, result: won ? 'won' : accepted ? 'selected' : 'rejected' };
      let newPres = state.prestige, newRep = state.reputation, newLog = [...state.gameLog];
      if (won) {
        newPres += festival.prestigeBonus;
        newRep += festival.reputationBonus;
        newLog.push({ text: `${film.title} WON at ${festival.name}! +${festival.prestigeBonus} prestige, +${festival.reputationBonus} rep.`, type: 'success' });
      } else if (accepted) {
        newPres += Math.round(festival.prestigeBonus * 0.4);
        newRep += Math.round(festival.reputationBonus * 0.4);
        newLog.push({ text: `${film.title} was selected for ${festival.name}! +${Math.round(festival.prestigeBonus * 0.4)} prestige.`, type: 'info' });
      } else {
        newLog.push({ text: `${film.title} was not selected for ${festival.name}.`, type: 'warning' });
      }
      return {
        ...state,
        festivalSubmissions: [...state.festivalSubmissions, submission],
        prestige: newPres,
        reputation: newRep,
        gameLog: newLog,
      };
    }

    case 'PRODUCE_TV_SHOW': {
      const tvCost = 5000000; // $5M per season
      if (state.cash < tvCost) return { ...state, errorMsg: 'Not enough cash for a TV show!' };
      if (!state.streamingPlatform) return { ...state, errorMsg: 'You need a streaming platform first! (Available after 2005)' };
      const tvGenre = action.genre || 'Drama Series';
      const quality = randInt(40, 85) + (state.facilitiesLevel * 2);
      const subscriberBoost = Math.round(quality * 500 + Math.random() * 20000);
      const show = {
        id: state.nextId,
        title: `${pick(['The', 'Dark', 'New', 'Lost', 'Last', 'First'])} ${pick(['Crown', 'Signal', 'Protocol', 'Frontier', 'Dynasty', 'Circuit', 'Legacy', 'Horizon'])}`,
        genre: tvGenre, quality: clamp(quality, 30, 95), seasons: 1, subscriberBoost, monthlyRevenue: Math.round(subscriberBoost * 0.7),
        status: 'airing',
      };
      return {
        ...state,
        cash: state.cash - tvCost,
        tvShows: [...state.tvShows, show],
        streamingPlatform: { ...state.streamingPlatform, subscribers: state.streamingPlatform.subscribers + subscriberBoost },
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Greenlit TV show: ${show.title} (${tvGenre}). Quality: ${show.quality}. +${subscriberBoost.toLocaleString()} subscribers.`, type: 'success' }],
      };
    }

    case 'DIRECTORS_CUT': {
      const origFilm = state.films.find(f => f.id === action.filmId && f.status === 'released');
      if (!origFilm) return state;
      if (state.reReleases.some(r => r.filmId === action.filmId)) return { ...state, errorMsg: "Already re-released this film!" };
      const reReleaseCost = Math.round(origFilm.budget * 0.15);
      if (state.cash < reReleaseCost) return { ...state, errorMsg: 'Not enough cash for re-release!' };
      const yearsSince = state.year - origFilm.releasedYear;
      const nostalgiaBonus = Math.min(yearsSince * 0.02, 0.5); // up to 50% bonus for old films
      const reGross = Math.round(origFilm.totalGross * (0.1 + nostalgiaBonus + Math.random() * 0.1));
      const reRelease = { filmId: origFilm.id, year: state.year, gross: reGross };
      return {
        ...state,
        cash: state.cash - reReleaseCost + Math.round(reGross * 0.45),
        totalGross: state.totalGross + reGross,
        reReleases: [...state.reReleases, reRelease],
        gameLog: [...state.gameLog, { text: `Director's Cut of "${origFilm.title}" re-released! Grossed ${fmt(reGross)}. Net: ${fmt(Math.round(reGross * 0.45) - reReleaseCost)}.`, type: reGross * 0.45 > reReleaseCost ? 'success' : 'warning' }],
      };
    }

    case 'CO_PRODUCE': {
      if (state.competitors.length === 0) return state;
      const rival = state.competitors[action.rivalIdx || 0];
      if (!rival) return state;
      // Co-production shares cost 50/50 by default
      return {
        ...state,
        coProductions: [...state.coProductions, { rivalName: rival.name, active: true, costShare: 0.5, profitShare: 0.5 }],
        gameLog: [...state.gameLog, { text: `Entered co-production deal with ${rival.name}. Costs and profits split 50/50 on next film.`, type: 'info' }],
      };
    }

    case 'GO_PUBLIC': {
      if (state.isPublic) return { ...state, errorMsg: 'Already public!' };
      const req = IPO_REQUIREMENTS;
      if (state.cash < req.minCash) return { ...state, errorMsg: `Need ${fmt(req.minCash)} cash for IPO.` };
      if (state.reputation < req.minReputation) return { ...state, errorMsg: `Need ${req.minReputation} reputation for IPO.` };
      if (state.prestige < req.minPrestige) return { ...state, errorMsg: `Need ${req.minPrestige} prestige for IPO.` };
      if (state.totalFilmsReleased < req.minFilms) return { ...state, errorMsg: `Need ${req.minFilms} released films for IPO.` };
      const ipoPrice = Math.round(state.cash / 1e6 + state.prestige * 2 + state.reputation);
      const ipoRaise = ipoPrice * 1e6 * 0.5; // IPO raises 50% of market cap
      const ipoEdition = (state.newspaperEdition || 0) + 1;
      return {
        ...state,
        isPublic: true,
        cash: state.cash - req.ipoCost + ipoRaise,
        stockPrice: ipoPrice,
        stockPricePeak: ipoPrice,
        stockHistory: [{ turn: state.turn, price: ipoPrice }],
        shareholderDemand: 20,
        gameLog: [...state.gameLog, { text: `${state.studioName} goes PUBLIC! IPO at $${ipoPrice}/share. Raised ${fmt(ipoRaise)}!`, type: 'success' }],
        newspaperEdition: ipoEdition,
        newspaperQueue: [...(state.newspaperQueue || []), makeNewspaper('ipo', { studio: state.studioName, price: `$${ipoPrice}`, value: fmt(ipoPrice * 1e6) }, state.year, state.month, ipoEdition)].filter(Boolean),
      };
    }

    case 'BUY_THEATER_CHAIN': {
      const chain = THEATER_CHAINS[action.chainIdx];
      if (!chain) return state;
      if (state.cash < chain.cost) return { ...state, errorMsg: `Not enough cash for ${chain.name}!` };
      if (state.theaterChains.some(c => c.name === chain.name)) return { ...state, errorMsg: 'Already own this chain!' };
      return {
        ...state,
        cash: state.cash - chain.cost,
        theaterChains: [...state.theaterChains, { ...chain }],
        gameLog: [...state.gameLog, { text: `Acquired ${chain.name}! +${(chain.screenBonus * 100).toFixed(0)}% screen bonus, ${(chain.ticketCut * 100).toFixed(0)}% cut of all ticket sales.`, type: 'success' }],
      };
    }

    case 'BUILD_THEME_PARK': {
      const tier = THEME_PARK_TIERS[action.tierIdx];
      if (!tier) return state;
      if (state.cash < tier.cost) return { ...state, errorMsg: `Not enough cash for ${tier.name}!` };
      if (state.franchises.length < tier.minFranchises) return { ...state, errorMsg: `Need ${tier.minFranchises} franchises for ${tier.name}!` };
      return {
        ...state,
        cash: state.cash - tier.cost,
        themeParks: [...state.themeParks, { ...tier, turnsLeft: tier.buildMonths, operational: false }],
        gameLog: [...state.gameLog, { text: `Building ${tier.name}! Construction: ${tier.buildMonths} months. Revenue when operational: ${fmt(tier.monthlyRevenue)}/month.`, type: 'success' }],
      };
    }

    case 'ACQUIRE_RIVAL': {
      const rival = state.competitors[action.rivalIdx];
      if (!rival) return state;
      // Acquisition cost based on studio value
      const studioValue = rival.cash + rival.totalGross * 0.15 + rival.reputation * 2e6 + (rival.prestige || 0) * 1e6 + (rival.awards || 0) * 5e6;
      const tierPremium = rival.tier === 'major' ? 2.5 : rival.tier === 'mid' ? 1.8 : 1.2;
      const acquisitionCost = Math.round(studioValue * tierPremium);

      if (state.cash < acquisitionCost) return { ...state, errorMsg: `${rival.name} costs ${fmt(acquisitionCost)} to acquire. Not enough cash!` };
      if (rival.reputation > state.reputation + 15) return { ...state, errorMsg: `${rival.name} is too prestigious to acquire — build your reputation first.` };

      const newCompetitors = state.competitors.filter((_, i) => i !== action.rivalIdx);

      // Transfer film catalog
      const transferredFilmCount = (state.allFilmHistory || []).filter(f => f.studio === rival.name).length;
      const updatedHistory = (state.allFilmHistory || []).map(f =>
        f.studio === rival.name ? { ...f, studio: state.studioName, originalStudio: f.originalStudio || f.studio, acquiredFrom: rival.name } : f
      );

      // Absorb some of their talent (random chance for each hypothetical talent)
      const absorbedTalentCount = randInt(1, 3);
      const newTalent = [];
      for (let i = 0; i < absorbedTalentCount; i++) {
        const types = ['actor', 'director', 'writer', 'producer'];
        const t = makeTalent(state.nextId + i + 50, pick(types), [40, 80]);
        newTalent.push(t);
      }

      const acqEdition = (state.newspaperEdition || 0) + 1;
      return {
        ...state,
        cash: state.cash - acquisitionCost + Math.round(rival.cash * 0.7), // get 70% of their cash reserves
        reputation: clamp(state.reputation + Math.round(rival.reputation * 0.1), 0, 100),
        prestige: clamp(state.prestige + Math.round((rival.prestige || 0) * 0.15), 0, 100),
        totalAwards: state.totalAwards + (rival.awards || 0),
        acquiredStudios: [...state.acquiredStudios, rival.name],
        competitors: newCompetitors,
        allFilmHistory: updatedHistory,
        availableTalent: [...state.availableTalent, ...newTalent],
        nextId: state.nextId + absorbedTalentCount + 50,
        gameLog: [...state.gameLog, {
          text: `ACQUIRED ${rival.name} for ${fmt(acquisitionCost)}! Gained ${fmt(Math.round(rival.cash * 0.7))} cash, ${transferredFilmCount} films, ${absorbedTalentCount} talent, and ${rival.awards || 0} awards.`,
          type: 'success'
        }],
        newspaperEdition: acqEdition,
        newspaperQueue: [...(state.newspaperQueue || []), makeNewspaper('acquisition', { studio: state.studioName, target: rival.name }, state.year, state.month, acqEdition)].filter(Boolean),
      };
    }

    case 'START_BIDDING_WAR': {
      const { targetType, targetData, startingBid, rivals } = action;
      const biddingRivals = (rivals || []).slice(0, 3).map(r => ({
        name: r.name, bid: Math.round(startingBid * (0.85 + Math.random() * 0.3)),
        personality: getBiddingPersonality(r), folded: false, cash: r.cash || 100e6,
      }));
      return { ...state, activeBidding: { type: targetType, target: targetData, playerBid: startingBid,
        rivals: biddingRivals, round: 1, maxRounds: 5, status: 'active', history: [{ round: 1, event: 'Bidding opens!' }] } };
    }

    case 'RAISE_BID': {
      if (!state.activeBidding || state.activeBidding.status !== 'active') return state;
      const bid = state.activeBidding;
      const raiseAmt = action.amount || Math.round(bid.playerBid * 0.15);
      const newPlayerBid = bid.playerBid + raiseAmt;
      if (state.cash < newPlayerBid) return { ...state, errorMsg: `Need ${fmt(newPlayerBid)} to raise!` };
      const newRound = bid.round + 1;
      const history = [...bid.history, { round: newRound, event: `You raise to ${fmt(newPlayerBid)}` }];
      const newRivals = bid.rivals.map(r => {
        if (r.folded) return r;
        const p = r.personality;
        if (newPlayerBid > r.cash * 0.3 || Math.random() < p.foldChance * (newRound / 3)) {
          history.push({ round: newRound, event: `${r.name} folds! "Too rich for my blood."` });
          return { ...r, folded: true };
        }
        const mult = p.raiseMult[0] + Math.random() * (p.raiseMult[1] - p.raiseMult[0]);
        const rivalBid = Math.round(newPlayerBid * mult);
        history.push({ round: newRound, event: `${r.name} counters: ${fmt(rivalBid)}` });
        return { ...r, bid: rivalBid };
      });
      if (newRound >= 2 && newRound <= 3 && Math.random() < 0.12) {
        const jumper = (state.competitors || []).find(c => !newRivals.some(r => r.name === c.name) && c.cash > newPlayerBid);
        if (jumper) {
          newRivals.push({ name: jumper.name, bid: Math.round(newPlayerBid * 1.05), personality: getBiddingPersonality(jumper), folded: false, cash: jumper.cash });
          history.push({ round: newRound, event: `SURPRISE! ${jumper.name} enters the bidding!` });
        }
      }
      const allFolded = newRivals.every(r => r.folded);
      const maxed = newRound >= bid.maxRounds;
      let status = 'active';
      if (allFolded) { status = 'won'; history.push({ round: newRound, event: `SOLD! You win at ${fmt(newPlayerBid)}!` }); }
      else if (maxed) {
        const top = newRivals.filter(r => !r.folded).sort((a, b) => b.bid - a.bid)[0];
        if (top && top.bid > newPlayerBid) { status = 'lost'; history.push({ round: newRound, event: `${top.name} wins with ${fmt(top.bid)}.` }); }
        else { status = 'won'; history.push({ round: newRound, event: `GOING ONCE... GOING TWICE... SOLD for ${fmt(newPlayerBid)}!` }); }
      }
      return { ...state, activeBidding: { ...bid, playerBid: newPlayerBid, rivals: newRivals, round: newRound, history, status } };
    }

    case 'WALK_AWAY_BID': {
      if (!state.activeBidding) return state;
      const b = state.activeBidding;
      const top = b.rivals.filter(r => !r.folded).sort((a, b2) => b2.bid - a.bid)[0];
      return { ...state, activeBidding: { ...b, status: 'lost', history: [...b.history, { round: b.round, event: `You walk away.${top ? ' ' + top.name + ' wins.' : ''}` }] } };
    }

    case 'CLOSE_BIDDING': {
      if (!state.activeBidding) return state;
      const bid = state.activeBidding;
      if (bid.status === 'won') {
        const cost = bid.playerBid;
        const ratio = cost / (bid.target.baseValue || cost);
        const msg = ratio > 1.5 ? ' You massively overpaid!' : ratio > 1.2 ? ' You paid a premium.' : '';
        if (bid.type === 'script') {
          const script = state.scripts[bid.target.scriptIdx];
          if (!script) return { ...state, activeBidding: null };
          return { ...state, cash: state.cash - cost, activeBidding: null,
            devScriptIdx: bid.target.scriptIdx, devBudgetM: Math.round((script.budgetMin + script.budgetMax) / 2), devMarketingM: 0,
            devDirectorId: state.contracts.find(t => t.type === 'director')?.id ?? null,
            devActorId: state.contracts.find(t => t.type === 'actor')?.id ?? null,
            devSupporting1Id: null, devSupporting2Id: null, devEnsembleId: null,
            devWriterId: state.contracts.find(t => t.type === 'writer')?.id ?? null,
            devProducerId: state.contracts.find(t => t.type === 'producer')?.id ?? null,
            devFilmType: 'original', devGenre2: script.genre2 || null, devTone: 'serious', devThemes: [],
            devPostProdChoice: 'standard_edit',
            gameLog: [...state.gameLog, { text: `Won bidding war for "${script.title}" at ${fmt(cost)}.${msg}`, type: ratio > 1.5 ? 'warning' : 'success' }], errorMsg: '' };
        }
        return { ...state, cash: state.cash - cost, activeBidding: null,
          gameLog: [...state.gameLog, { text: `Won bidding war for ${bid.target.name} at ${fmt(cost)}.${msg}`, type: ratio > 1.5 ? 'warning' : 'success' }] };
      }
      return { ...state, activeBidding: null };
    }

    case 'CLEAR_CELEBRATION':
      return { ...state, celebration: null };

    case 'DISMISS_NEWSPAPER': {
      const queue = [...(state.newspaperQueue || [])];
      const dismissed = queue.shift();
      const archive = dismissed ? [...(state.newspaperArchive || []), dismissed] : (state.newspaperArchive || []);
      return { ...state, newspaperQueue: queue, newspaperArchive: archive.slice(-50) };
    }

    case 'SKIP_ALL_NEWSPAPERS': {
      const allNews = [...(state.newspaperArchive || []), ...(state.newspaperQueue || [])];
      return { ...state, newspaperQueue: [], newspaperArchive: allNews.slice(-50) };
    }

    case 'DISMISS_TURN_SUMMARY':
      return { ...state, showTurnSummary: false, turnSummary: null };

    case 'TOGGLE_SUMMARY_SECTION':
      return { ...state, turnSummaryExpanded: { ...state.turnSummaryExpanded, [action.section]: !state.turnSummaryExpanded[action.section] } };

    case 'CLEAR_TAB_BADGE':
      return { ...state, tabBadges: { ...state.tabBadges, [action.tab]: 0 } };

    case 'SET_LOG_FILTER':
      return { ...state, logFilter: action.filter };

    case 'REJECT_TAKEOVER':
      return { ...state, hostileTakeoverOffer: null, takeoverCooldown: 12, takeoverWarningLevel: 0, gameLog: [...state.gameLog, { text: 'Hostile takeover offer rejected! Rivals will regroup. (12-month cooldown.)', type: 'info' }] };

    case 'ACCEPT_TAKEOVER':
      return { ...state, phase: 'legacy', hostileTakeoverOffer: null, gameLog: [...state.gameLog, { text: `${state.studioName} was acquired. The era ends.`, type: 'warning' }] };

    case 'TRAIN_TALENT': {
      const trainingCost = 1000000;
      if (state.cash < trainingCost) return { ...state, errorMsg: 'Need $1M to start training!' };
      const type = action.talentType || 'actor';
      const potential = randInt(50, 95);
      const trainee = {
        id: state.nextId, name: makeName(), type, skill: randInt(15, 30),
        turnsLeft: randInt(8, 16), potential,
      };
      return {
        ...state,
        cash: state.cash - trainingCost,
        academy: [...state.academy, trainee],
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Started training ${trainee.name} (${type}). Potential: ${potential}. Ready in ~${trainee.turnsLeft} months.`, type: 'info' }],
      };
    }

    case 'NEGOTIATE_TALENT': {
      const talent = state.availableTalent.find(t => t.id === action.talentId);
      if (!talent) return state;
      // Agent counter-offers: higher salary, perks, exclusive deal
      const salaryMult = 1 + Math.random() * 0.5; // 0-50% higher
      const counterSalary = Math.round(talent.salary * salaryMult);
      const wantsExclusive = Math.random() < 0.3;
      const wantsPerks = Math.random() < 0.5;
      const perks = wantsPerks ? pick(['Private trailer on all sets', 'First-class travel', 'Profit participation (2%)', 'Creative control clause', 'Personal chef on set']) : null;
      return {
        ...state,
        pendingNegotiation: { talentId: talent.id, originalSalary: talent.salary, counterOffer: counterSalary, exclusive: wantsExclusive, perks, talentName: talent.name },
      };
    }

    case 'ACCEPT_NEGOTIATION': {
      if (!state.pendingNegotiation) return state;
      const neg = state.pendingNegotiation;
      const talent = state.availableTalent.find(t => t.id === neg.talentId);
      if (!talent) return { ...state, pendingNegotiation: null };
      const updatedTalent = { ...talent, salary: neg.counterOffer, contractYears: neg.exclusive ? talent.contractYears + 2 : talent.contractYears };
      return {
        ...state,
        contracts: [...state.contracts, updatedTalent],
        availableTalent: state.availableTalent.filter(t => t.id !== neg.talentId),
        pendingNegotiation: null,
        gameLog: [...state.gameLog, { text: `Signed ${neg.talentName} after negotiations. Salary: ${fmt(neg.counterOffer)}/yr${neg.exclusive ? ' (exclusive deal)' : ''}${neg.perks ? ` — Perk: ${neg.perks}` : ''}.`, type: 'success' }],
      };
    }

    case 'REJECT_NEGOTIATION':
      return { ...state, pendingNegotiation: null, gameLog: [...state.gameLog, { text: 'Negotiations fell through.', type: 'warning' }] };

    case 'END_TURN': {
      // Deep clone mutable parts
      let films = state.films.map(f => ({ ...f, events: [...(f.events || [])] }));
      let log = [...state.gameLog];
      let rep = state.reputation;
      let pres = state.prestige;
      let cash = state.cash;
      let tGross = state.totalGross;
      let tAwards = state.totalAwards;
      let milestones = { ...state.milestones };
      let awards = [...state.awards];
      let streaming = state.streamingPlatform ? { ...state.streamingPlatform } : null;
      let franchises = state.franchises.map(f => ({ ...f, filmIds: [...f.filmIds] }));
      let genreFanbase = { ...(state.genreFanbase || {}) };
      let theaterChains = (state.theaterChains || []).map(c => ({ ...c }));
      let stockPrice = state.stockPrice;
      let stockPricePeak = state.stockPricePeak || 0;
      let talentRelationships = { ...(state.talentRelationships || {}) };
      let consecutiveFlops = state.consecutiveFlops || 0;
      let takeoverCooldown = Math.max(0, (state.takeoverCooldown || 0) - 1);
      let takeoverWarningLevel = state.takeoverWarningLevel || 0;

      let newspaperQueue = [...(state.newspaperQueue || [])];
      let newspaperEdition = state.newspaperEdition || 0;

      let celebration = state.celebration;

      // Turn Summary data collection
      const turnSummaryData = {
        boxOffice: [],       // films released this turn with scores/gross
        production: [],      // films advancing phases, filming events
        talent: [],          // career changes, contracts, new talent
        market: [],          // stock, economic cycles, quarterly
        rivals: [],          // competitor actions
        intelligence: [],    // espionage, coalitions, regulations
        streaming: [],       // subscriber updates, content, rival platforms
      };

      let revenue = 0;
      let expenses = 0;
      let totalFilmsReleased = state.totalFilmsReleased;

      // 1. Pick a random event
      const eventTemplate = pick(RANDOM_EVENTS);
      let eventText = eventTemplate.text;
      let eventGenre = pick(GENRES);
      eventText = eventText.replace('{genre}', eventGenre);
      log.push({ text: `EVENT: ${eventText}`, type: eventTemplate.type === 'bust' || eventTemplate.type === 'budgetOverrun' ? 'warning' : 'info', category: 'market' });
      turnSummaryData.market.push({ text: eventText });

      // FEATURE 5: Production Scandals
      films.forEach(f => {
        if (['production', 'postproduction', 'principal_photography', 'post_production', 'pre_production'].includes(f.status)) {
          PRODUCTION_SCANDALS.forEach(scandal => {
            if (Math.random() < scandal.chance) {
              f.events.push(`SCANDAL: ${scandal.name}`);
              f._qualityBoost = (f._qualityBoost || 0) + scandal.qualityHit;
              f.budget = Math.round(f.budget * (1 + scandal.costIncrease));
              cash -= Math.round(f.budget * scandal.costIncrease);
              rep += scandal.repChange;
              log.push({ text: `SCANDAL on "${f.title}": ${scandal.desc}`, type: 'warning', category: 'production' });
              // NEWSPAPER: Major scandal (only for big-budget films)
              if (f.budget >= 30e6) {
                newspaperEdition++;
                const scN = makeNewspaper('scandal', { studio: state.studioName, film: f.title, scandal: scandal.name }, state.year, state.month, newspaperEdition);
                if (scN) newspaperQueue.push(scN);
              }
            }
          });
        }
      });

      // Apply pre-release event effects
      if (eventTemplate.type === 'qualityBoost') {
        const inProd = films.filter(f => ['development', 'production', 'postproduction'].includes(f.status));
        if (inProd.length > 0) {
          const target = pick(inProd);
          target.events.push('Creative breakthrough (+10 quality)');
          // We'll apply this as a bonus when calculating quality
          target._qualityBoost = 10;
        }
      }
      if (eventTemplate.type === 'budgetOverrun') {
        const inProd = films.filter(f => f.status === 'production' || f.productionPhase === 'principal_photography');
        if (inProd.length > 0) {
          const target = pick(inProd);
          const overrun = Math.round(target.budget * 0.25);
          target.budget += overrun;
          target.events.push(`Budget overrun: +${fmt(overrun)}`);
          cash -= overrun;
          log.push({ text: `"${target.title}" hit a budget overrun of ${fmt(overrun)}!`, type: 'warning', category: 'production' });
        }
      }
      if (eventTemplate.type === 'prestigeBoost') pres += 5;
      if (eventTemplate.type === 'reputationBoost') rep += 5;
      if (eventTemplate.type === 'publicity') { rep += 3; pres += 2; }
      if (eventTemplate.type === 'talentInflation') {
        // We just log it — doesn't permanently change things
      }
      if (eventTemplate.type === 'festivalCannes') pres += 8;
      if (eventTemplate.type === 'festivalSundance') { pres += 5; rep += 3; }
      if (eventTemplate.type === 'festivalVenice') pres += 10;
      if (eventTemplate.type === 'scandal') rep -= 5;
      if (eventTemplate.type === 'writersStrike') {
        films.filter(f => f.status === 'development' || f.status === 'script_dev').forEach(f => { f.turnsNeeded += 1; f.events.push("Writers' strike delay"); });
      }
      if (eventTemplate.type === 'actorsStrike') {
        films.filter(f => f.status === 'production' || f.productionPhase === 'principal_photography').forEach(f => { f.turnsNeeded += 1; f.events.push("Actors' dispute delay"); });
      }
      if (eventTemplate.type === 'techBreakthrough') {
        films.filter(f => f.status === 'production' || f.productionPhase === 'principal_photography' || f.productionPhase === 'post_production').forEach(f => {
          const savings = Math.round(f.budget * 0.15);
          f.budget -= savings;
          cash += savings;
          f.events.push(`Tech savings: ${fmt(savings)}`);
        });
      }
      if (eventTemplate.type === 'starViral' && state.contracts.length > 0) {
        const target = pick(state.contracts);
        log.push({ text: `${target.name} goes viral! +10 popularity.`, type: 'success', category: 'talent' });
      }

      // 2. Advance films through PRODUCTION PIPELINE (5 phases)
      films = films.map(film => {
        if (film.status === 'released' || film.status === 'completed' || film.status === 'scheduled') return film;

        const f = { ...film };
        f.turnsInStatus = (f.turnsInStatus || 0) + 1;
        const phase = f.productionPhase || f.status;

        // === SCRIPT DEVELOPMENT PHASE ===
        if (phase === 'script_dev' || f.status === 'development') {
          if (f.turnsInStatus >= (f.phaseTurns?.script_dev ?? f.turnsNeeded ?? 1)) {
            // Script quality contribution from writer
            f._scriptQuality = Math.round(f.writer.skill * 0.3 + (Math.random() - 0.3) * 8);
            f.productionPhase = 'pre_production';
            f.status = 'pre_production';
            f.turnsInStatus = 0;
            f.turnsNeeded = f.phaseTurns?.pre_production ?? 1;
            log.push({ text: `"${f.title}" — Script locked! Moving to pre-production.`, type: 'info', category: 'production' });
            turnSummaryData.production.push({ title: f.title, update: 'Script locked — moving to pre-production', phase: 'pre_production' });
          }
        }
        // === PRE-PRODUCTION PHASE ===
        else if (phase === 'pre_production') {
          if (f.turnsInStatus >= (f.phaseTurns?.pre_production ?? 1)) {
            f.productionPhase = 'principal_photography';
            f.status = 'production';
            f.turnsInStatus = 0;
            f.turnsNeeded = f.phaseTurns?.principal_photography ?? 2;
            log.push({ text: `"${f.title}" — Cameras rolling! Principal photography begins.`, type: 'info', category: 'production' });
            turnSummaryData.production.push({ title: f.title, update: 'Cameras rolling — principal photography begins', phase: 'principal_photography' });
          }
        }
        // === PRINCIPAL PHOTOGRAPHY PHASE ===
        else if (phase === 'principal_photography' || (f.status === 'production' && !f.productionPhase)) {
          // Random filming events each turn
          FILMING_EVENTS.forEach(evt => {
            if (Math.random() < evt.chance) {
              const qualMod = evt.qualityMod[0] + Math.random() * (evt.qualityMod[1] - evt.qualityMod[0]);
              f._filmingQuality = (f._filmingQuality || 0) + Math.round(qualMod);
              if (evt.costMod !== 0) {
                const costChange = Math.round(f.budget * Math.abs(evt.costMod));
                const cappedCost = f.insured && evt.costMod > 0 ? Math.min(costChange, Math.round(f.budget * 0.05)) : costChange;
                if (evt.costMod > 0) { f.budget += cappedCost; cash -= cappedCost; expenses += cappedCost; }
                else { cash += cappedCost; }
                f.events.push(`${evt.name}: ${evt.costMod > 0 ? '+' : '-'}${fmt(cappedCost)}`);
              }
              f.productionEvents = [...(f.productionEvents || []), { id: evt.id, name: evt.name, qualMod: Math.round(qualMod) }];
              log.push({ text: `🎬 "${f.title}" — ${evt.name}: ${evt.desc}${Math.round(qualMod) !== 0 ? ` (Quality ${Math.round(qualMod) > 0 ? '+' : ''}${Math.round(qualMod)})` : ''}`, type: qualMod >= 0 ? 'info' : 'warning', category: 'production' });
              turnSummaryData.production.push({ title: f.title, update: `${evt.name}: ${evt.desc}`, event: evt.name, phase: 'principal_photography' });
            }
          });

          if (f.turnsInStatus >= (f.phaseTurns?.principal_photography ?? f.turnsNeeded ?? 2)) {
            f.productionPhase = 'post_production';
            f.status = 'postproduction';
            f.turnsInStatus = 0;
            f.turnsNeeded = f.phaseTurns?.post_production ?? 2;
            log.push({ text: `"${f.title}" — That's a wrap! Moving to post-production.`, type: 'success', category: 'production' });
            turnSummaryData.production.push({ title: f.title, update: "That's a wrap! Moving to post-production", phase: 'post_production' });
          }
        }
        // === POST-PRODUCTION PHASE ===
        else if (phase === 'post_production' || f.status === 'postproduction') {
          if (f.turnsInStatus >= (f.phaseTurns?.post_production ?? f.turnsNeeded ?? 1)) {
            // Apply post-production decision
            const ppChoice = POST_PROD_DECISIONS.find(p => p.id === (f.postProdChoice || 'standard_edit')) || POST_PROD_DECISIONS[0];
            f._postProdQuality = ppChoice.qualityMod || 0;
            if (ppChoice.genreBonus && ppChoice.genreBonus.includes(f.genre)) f._postProdQuality += 4;
            if (ppChoice.audienceMod) f._postProdAudienceMod = ppChoice.audienceMod;
            const ppCostAdj = Math.round(f.budget * 0.1 * (ppChoice.costMult - 1));
            if (ppCostAdj > 0) { f.budget += ppCostAdj; cash -= ppCostAdj; expenses += ppCostAdj; }
            else if (ppCostAdj < 0) { cash += Math.abs(ppCostAdj); }

            f.productionPhase = 'marketing_campaign';
            f.status = 'marketing_campaign';
            f.turnsInStatus = 0;
            f.turnsNeeded = f.phaseTurns?.marketing_campaign ?? 1;
            log.push({ text: `"${f.title}" — Post-production complete (${ppChoice.name}). Marketing campaign begins.`, type: 'info', category: 'production' });
            turnSummaryData.production.push({ title: f.title, update: `Post-production complete (${ppChoice.name}) — marketing begins`, phase: 'marketing_campaign' });
          }
        }
        // === MARKETING CAMPAIGN PHASE ===
        else if (phase === 'marketing_campaign') {
          if (f.turnsInStatus >= (f.phaseTurns?.marketing_campaign ?? 1)) {
            // Film is done — move to 'completed', awaiting player to schedule release
            f.productionPhase = 'completed';
            f.status = 'completed';
            f.turnsInStatus = 0;
            f.turnsNeeded = 999;

            // CALCULATE FINAL QUALITY with all pipeline bonuses
            let quality = calcQuality(f, state.facilitiesLevel, state.genreTrends[f.genre] || 0, state.specialization);

            // Director genre expertise
            if (f.director?.genreBonus === f.genre) quality = clamp(quality + DIRECTOR_GENRE_EXPERTISE_BONUS, 5, 98);
            else if (f.director?.genreBonus && f.director.genreBonus !== f.genre) quality = clamp(quality + DIRECTOR_GENRE_MISMATCH_PENALTY, 5, 98);
            // Director proven in genre (had a hit)
            const dirPrevHits = (state.films || []).filter(pf => pf.status === 'released' && pf.director?.id === f.director?.id && pf.genre === f.genre && (pf.profit || 0) > 0);
            if (dirPrevHits.length > 0) quality = clamp(quality + DIRECTOR_PROVEN_BONUS, 5, 98);

            // Multi-cast quality contribution
            if (f.castMembers && f.castMembers.length > 1) {
              let castBonus = 0;
              f.castMembers.forEach((cm, idx) => {
                const role = CAST_ROLES[idx] || CAST_ROLES[CAST_ROLES.length - 1];
                castBonus += cm.skill * role.qualityWeight * 0.4;
                if (cm.genreBonus === f.genre) castBonus += 2;
              });
              quality = clamp(quality + Math.round(castBonus), 5, 98);
            }

            // Pipeline quality contributions
            quality = clamp(quality + (f._scriptQuality || 0) + (f._filmingQuality || 0) + (f._postProdQuality || 0), 5, 98);

            if (f._qualityBoost) quality = clamp(quality + f._qualityBoost, 5, 98);
            state.unlockedTech.forEach(tid => {
              const tech = TECH_TREE.find(t => t.id === tid);
              if (tech) quality = clamp(quality + Math.round(tech.qualityBonus * 0.3), 5, 98);
            });
            const movementBoost = getMovementBoost(state.year, f.genre);
            if (movementBoost > 0) quality = clamp(quality + Math.round(movementBoost * 5), 5, 98);
            const chem = calcChemistry(f.director?.id, f.actor?.id, state.films);
            if (chem.bonus > 0) quality = clamp(quality + chem.bonus, 5, 98);
            const loc = FILMING_LOCATIONS.find(l => l.id === (f.location || 'hollywood'));
            if (loc) quality = clamp(quality + loc.qualityBonus, 5, 98);
            (state.studioLots || []).forEach(owned => {
              const lotDef = STUDIO_LOTS.find(l => l.id === owned.id);
              if (lotDef && lotDef.genres && lotDef.genres.includes(f.genre)) {
                quality = clamp(quality + lotDef.qualityBonus, 5, 98);
              }
            });
            f.quality = quality;

            // Assign rating
            if (f.targetRating) {
              f.rating = f.targetRating;
              const autoRating = getAutoRating(f.genre, quality, f.budget);
              if (autoRating !== f.targetRating) {
                const mismatchPenalty = f.targetRating === 'NC-17' || f.targetRating === 'G' ? 3 : 2;
                quality = clamp(quality - mismatchPenalty, 5, 98);
                f.quality = quality;
                log.push({ text: `"${f.title}" rated ${f.targetRating} (natural fit was ${autoRating}). Slight quality impact.`, type: 'warning' });
              }
            } else {
              f.rating = getAutoRating(f.genre, quality, f.budget);
            }

            log.push({ text: `🎬 "${f.title}" has wrapped all production! Quality: ${quality}/100. Schedule its release.`, type: 'success', category: 'production' });
            turnSummaryData.production.push({ title: f.title, update: `Production complete! Quality: ${quality}/100 — ready to schedule release`, phase: 'completed' });
          }
        }
        return f;
      });

      // 2b. Release films that were scheduled for this month
      films = films.map(film => {
        if (film.status !== 'scheduled') return film;
        if (film.scheduledMonth !== state.month || film.scheduledYear !== state.year) return film;

        const f = { ...film };
        f.status = 'released';
        f.releasedYear = state.year;
        f.releasedMonth = state.month;

        // Get the release window and its multiplier
        const windows = RELEASE_WINDOWS[state.month] || [];
        const window = windows.find(w => w.id === f.releaseWindow) || windows[0];
        const windowMult = window ? getWindowMultiplier(window, f.genre) : 1.0;

        // Calculate box office with window multiplier
        let box = calcBoxOffice(f.quality, f.budget, f.marketing, state.year, f.genre, f);

        // Apply window multiplier
        box.domestic = Math.round(box.domestic * windowMult);
        box.international = Math.round(box.international * windowMult);

        // Apply seasonal audience multiplier
        const seasonData = SEASONAL_COMPETITION[state.month];
        if (seasonData) {
          box.domestic = Math.round(box.domestic * seasonData.audienceMult);
        }

        // Apply competing films drain
        const monthCompetition = generateCompetingFilms(state.month, state.year, f.genre, state.competitors);
        const competitionDrain = calcCompetitionDrain(monthCompetition, f.genre, f.budget);
        box.domestic = Math.round(box.domestic * competitionDrain);
        box.international = Math.round(box.international * Math.max(0.7, competitionDrain * 1.1)); // intl less affected
        f.competingFilms = monthCompetition;
        f.competitionDrain = competitionDrain;
        if (competitionDrain < 0.85) {
          const clashFilm = monthCompetition.find(c => c.isGenreClash);
          log.push({ text: `📊 "${f.title}" faces stiff competition this month${clashFilm ? ` — "${clashFilm.name}" (${clashFilm.genre}) is a direct genre rival!` : '.'} Box office impact: ${Math.round((1 - competitionDrain) * 100)}% drain.`, type: 'warning', category: 'boxoffice' });
        }

        // Apply economic cycle multiplier
        const economicCycle = ECONOMIC_CYCLES.find(c => c.id === state.economicCycle.phase);
        const cycleGrossMult = economicCycle?.grossMult || 1.0;
        box.domestic = Math.round(box.domestic * cycleGrossMult);
        box.international = Math.round(box.international * cycleGrossMult);

        // Apply zeitgeist event gross multipliers
        const zeitgeistGrossMult = (state.activeZeitgeist || []).reduce((m, z) => m * (z.grossMult || 1.0), 1.0);
        box.domestic = Math.round(box.domestic * zeitgeistGrossMult);
        box.international = Math.round(box.international * zeitgeistGrossMult);

        // Apply coalition theatrical gross modifier
        const playerCoal = state.playerCoalition ? INDUSTRY_COALITIONS.find(c => c.id === state.playerCoalition) : null;
        if (playerCoal?.effect?.theatricalGrossMult) {
          box.domestic = Math.round(box.domestic * playerCoal.effect.theatricalGrossMult);
        }

        // Apply active regulation effects
        const hasExtendedWindows = (state.activeRegulations || []).some(r => r.id === 'extend_windows');
        if (hasExtendedWindows) {
          box.domestic = Math.round(box.domestic * 1.1); // 10% theatrical bonus
        }

        const hasForeignQuota = (state.activeRegulations || []).some(r => r.id === 'foreign_film_quota');
        if (hasForeignQuota) {
          box.domestic = Math.round(box.domestic * 1.1); // 10% domestic bonus
        }

        // FEATURE 6: International Box Office breakdown by market
        const intlResult = calcInternationalGross(box.domestic, f.genre, f.quality, f);
        f.internationalGross = intlResult.total;
        f.intlBreakdown = intlResult.breakdown;
        box.international = intlResult.total;

        box.totalGross = box.domestic + box.international;
        box.profit = Math.round(box.domestic * 0.50 + box.international * 0.25 - f.budget - f.marketing);

        // Fanbase loyalty boost
        const fanbase = (genreFanbase || {})[f.genre];
        if (fanbase && fanbase.loyalty > 20) {
          const fanBoost = 1 + (fanbase.loyalty / 100) * 0.25; // up to +25% for max loyalty
          box.domestic = Math.round(box.domestic * fanBoost);
        }

        // Demographic audience reach based on rating
        const filmRating = f.rating || 'PG-13';
        const ratingData = FILM_RATINGS.find(r => r.rating === filmRating);
        if (ratingData) {
          const demoMult = DEMOGRAPHICS.reduce((sum, demo) => {
            const genrePref = demo.genrePrefs[f.genre] || 0.8;
            const ratingPref = demo.ratingPrefs[filmRating] || 0.5;
            return sum + demo.share * genrePref * ratingPref;
          }, 0);
          box.domestic = Math.round(box.domestic * (0.7 + demoMult * 0.6));
          box.international = Math.round(box.international * (0.7 + demoMult * 0.5));
          // Controversy risk
          if (ratingData.controversyRisk > 0 && Math.random() < ratingData.controversyRisk) {
            const impact = Math.random() < 0.5 ? 1.15 : 0.80; // controversy can help or hurt
            box.domestic = Math.round(box.domestic * impact);
            if (impact < 1) log.push({ text: `"${f.title}" faced controversy over its ${filmRating} content. -20% domestic.`, type: 'warning', category: 'boxoffice' });
            else log.push({ text: `"${f.title}" generated buzz from its ${filmRating} controversy! +15% domestic.`, type: 'info', category: 'boxoffice' });
          }
        }

        // Named critic reviews (original system)
        const criticReviews = [];
        NAMED_CRITICS.forEach(critic => {
          let liking = 0;
          if (critic.taste.genres.includes(f.genre)) liking += 15;
          if (critic.taste.tones && critic.taste.tones.includes(f.tone)) liking += 10;
          if (f.budget >= critic.taste.minBudget && f.budget <= critic.taste.maxBudget) liking += 5;
          if (critic.contrarian) liking += (box.criticScore < 50 ? 10 : -5);
          const criticRating = clamp(Math.round(box.criticScore + liking + (Math.random() - 0.5) * 20), 5, 100);
          criticReviews.push({ name: critic.name, outlet: critic.outlet, rating: criticRating, weight: critic.weight });
          // Weighted influence on final critic score
          box.criticScore = Math.round(box.criticScore * 0.85 + criticRating * critic.weight * 0.15 / NAMED_CRITICS.length * NAMED_CRITICS.length);
        });
        f.criticReviews = criticReviews;

        // FEATURE 2: Named film critics (new system with unique personalities)
        f.filmCriticReviews = generateCriticReviews(f);

        // Star power opening weekend boost
        const starPow = calcStarPower(f.actor);
        if (starPow > 50) {
          const starMult = 1 + (starPow - 50) * 0.004; // up to +20% for 100 star power
          box.domestic = Math.round(box.domestic * starMult);
        }

        // Theater chain screen bonus
        const screenBonus = theaterChains.reduce((sum, c) => sum + c.screenBonus, 0);
        if (screenBonus > 0) {
          box.domestic = Math.round(box.domestic * (1 + screenBonus));
        }

        // Co-production cost sharing
        const coProd = state.coProductions.find(cp => cp.active);
        if (coProd) {
          box.profit = Math.round(box.profit * coProd.profitShare); // split profit
        }

        // Filming location tax break
        const filmLoc = FILMING_LOCATIONS.find(l => l.id === (f.location || 'hollywood'));
        if (filmLoc && filmLoc.taxBreak > 0) {
          const taxSavings = Math.round(f.budget * filmLoc.taxBreak);
          box.profit += taxSavings;
        }

        box.totalGross = box.domestic + box.international;
        box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing + (filmLoc ? Math.round(f.budget * filmLoc.taxBreak) : 0));

        // Apply distribution deal bonuses
        if (state.distributionDeal && state.distributionTurnsLeft > 0) {
          const dd = state.distributionDeal;
          if (dd.domesticBonus) box.domestic = Math.round(box.domestic * (1 + dd.domesticBonus));
          if (dd.intlBonus) box.international = Math.round(box.international * (1 + dd.intlBonus));
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }

        // Apply event modifiers on top
        if (eventTemplate.type === 'boom') {
          box.domestic = Math.round(box.domestic * 1.3);
          box.international = Math.round(box.international * 1.3);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'bust') {
          box.domestic = Math.round(box.domestic * 0.75);
          box.international = Math.round(box.international * 0.75);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'intlBoost') {
          box.international = Math.round(box.international * 1.2);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'genreBoost' && f.genre === eventGenre) {
          box.domestic = Math.round(box.domestic * 1.25);
          box.international = Math.round(box.international * 1.25);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'genreBust' && f.genre === eventGenre) {
          box.domestic = Math.round(box.domestic * 0.85);
          box.international = Math.round(box.international * 0.85);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'viralMoment') {
          box.domestic = Math.round(box.domestic * 1.15);
          box.international = Math.round(box.international * 1.15);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'competitionDrain') {
          box.domestic = Math.round(box.domestic * 0.90);
          box.international = Math.round(box.international * 0.90);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'nostalgiaWave' && (f.filmType === 'sequel' || f.filmType === 'reboot')) {
          box.domestic = Math.round(box.domestic * 1.25);
          box.international = Math.round(box.international * 1.25);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'originalityWave' && (f.filmType === 'original' || !f.filmType)) {
          box.domestic = Math.round(box.domestic * 1.20);
          box.international = Math.round(box.international * 1.20);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'recession') {
          box.domestic = Math.round(box.domestic * 0.80);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'economicBoom') {
          box.domestic = Math.round(box.domestic * 1.15);
          box.international = Math.round(box.international * 1.15);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }
        if (eventTemplate.type === 'currencyDrop') {
          box.international = Math.round(box.international * 0.85);
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
        }

        // Apply industry crisis effects
        (state.activeCrises || []).forEach(crisis => {
          if (crisis.effects.boxOfficeMod) {
            box.domestic = Math.round(box.domestic * (1 + crisis.effects.boxOfficeMod));
            box.international = Math.round(box.international * (1 + crisis.effects.boxOfficeMod));
          }
          if (crisis.effects.ratingPenalty && (f.rating === 'R' || f.rating === 'NC-17')) {
            box.domestic = Math.round(box.domestic * 0.7);
            box.international = Math.round(box.international * 0.7);
          }
          if (crisis.effects.indieBudgetBoost && f.budget < 20e6) {
            box.domestic = Math.round(box.domestic * 1.2);
            box.international = Math.round(box.international * 1.2);
          }
          if (crisis.effects.genreBoost && crisis.effects.genreBoost.includes(f.genre)) {
            box.domestic = Math.round(box.domestic * 1.15);
            box.international = Math.round(box.international * 1.15);
          }
        });
        box.totalGross = box.domestic + box.international;
        box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);

        f.criticScore = box.criticScore;
        f.audienceScore = box.audienceScore;
        f.domestic = box.domestic;
        f.international = box.international;
        f.totalGross = box.totalGross;
        f.profit = box.profit;
        f.regionBreakdown = box.regionBreakdown || {};

        // Deduct talent profit participation
        let talentParticipation = 0;
        [f.director, f.actor, f.writer].forEach(t => {
          if (t && t.profitParticipation && t.profitParticipation > 0 && f.totalGross > 0) {
            talentParticipation += Math.round(f.totalGross * t.profitParticipation / 100);
          }
        });
        if (talentParticipation > 0) {
          f.profit -= talentParticipation;
          f.events.push(`Talent backend: -${fmt(talentParticipation)}`);
        }

        // Investor revenue share
        if (f.investor) {
          const inv = INVESTOR_TYPES.find(i => i.id === f.investor);
          if (inv && box.profit > 0) {
            const investorCut = Math.round(box.profit * inv.revSharePct);
            box.profit -= investorCut;
            f.profit = box.profit;
            f.events.push(`Investor took ${fmt(investorCut)} (${Math.round(inv.revSharePct * 100)}% share)`);
          }
        }

        f.theatricalRun = simulateTheatricalRun(box.totalGross, f.quality, f.genre, f.rating || 'PG-13');

        revenue += f.profit;
        tGross += box.totalGross;
        totalFilmsReleased += 1;

        // Update genre fanbase
        const gf = { ...(genreFanbase[f.genre] || { loyalty: 0, films: 0 }) };
        gf.films += 1;
        if (f.quality >= 70) {
          gf.loyalty = Math.min(100, gf.loyalty + Math.round((f.quality - 50) * 0.3));
        } else if (f.quality < 40) {
          gf.loyalty = Math.max(0, gf.loyalty - 15);
        }
        genreFanbase[f.genre] = gf;

        const windowName = window ? window.name : 'Unknown';
        const multPct = Math.round((windowMult - 1) * 100);
        const multLabel = multPct >= 0 ? `+${multPct}%` : `${multPct}%`;
        const emoji = box.profit >= 0 ? '🎉' : '📉';
        log.push({ text: `${emoji} "${f.title}" released (${windowName}, ${multLabel})! Quality: ${f.quality} | Gross: ${fmt(box.totalGross)} | Profit: ${fmt(box.profit)}`, type: box.profit >= 0 ? 'success' : 'warning', category: 'boxoffice' });

        // Add to Turn Summary
        turnSummaryData.boxOffice.push({
          title: f.title,
          genre: f.genre,
          domestic: f.domestic,
          international: f.international,
          totalGross: f.totalGross,
          profit: f.profit,
          criticScore: f.criticScore,
          audienceScore: f.audienceScore,
          budget: f.budget,
          isIP: f.isIP,
          isSleeper: f.isSleeper,
        });

        // Talent dialogue on release
        const releaseDialogue = getTalentDialogue(box.profit >= 0 ? 'hit' : 'flop', f.actor);
        if (releaseDialogue && f.actor) {
          log.push({ text: `💬 ${f.actor.name}: "${releaseDialogue}"`, type: 'dialogue' });
        }

        // Track consecutive flops for takeover vulnerability
        if (box.profit < 0) {
          consecutiveFlops += 1;

          // === PUNISHING FLOPS: Cascading consequences ===
          const flopSev = calcFlopSeverity(f);
          rep = Math.max(0, rep - flopSev.repDmg);
          pres = Math.max(0, pres - flopSev.presDmg);

          // Stock price drop proportional to loss
          if (stockPrice > 0) {
            stockPrice = Math.round(stockPrice * (1 - flopSev.stockDrop));
          }

          // Director reputation damage — next project skepticism
          if (flopSev.level === 'catastrophic' || flopSev.level === 'devastating') {
            log.push({ text: `💥 MAJOR FLOP: "${f.title}" lost ${fmt(Math.abs(box.profit))}! ${flopSev.level === 'catastrophic' ? 'This is a studio-shaking disaster.' : 'Investors and board members are furious.'}`, type: 'warning', category: 'boxoffice' });
            // Big star career impact
            if (f.actor?.popularity > 60 && flopSev.level === 'catastrophic') {
              log.push({ text: `📉 ${f.actor.name}'s star power takes a hit after this high-profile disaster.`, type: 'warning', category: 'talent' });
            }
          }
        } else {
          consecutiveFlops = 0;
        }

        // === SLEEPER HIT DETECTION ===
        if (box.isSleeper) {
          f.isSleeper = true;
          const sleeperBonus = Math.round(box.domestic * 0.3); // extra domestic legs
          box.domestic += sleeperBonus;
          box.totalGross = box.domestic + box.international;
          box.profit = Math.round(box.totalGross * 0.45 - f.budget - f.marketing);
          log.push({ text: `🌟 SLEEPER HIT! "${f.title}" defies expectations with incredible word of mouth! Domestic +${fmt(sleeperBonus)}`, type: 'success', category: 'boxoffice' });
          // Newspaper for sleeper hits
          newspaperEdition++;
          const sleeperNews = makeNewspaper('box_office_100m', { film: f.title, studio: state.studioName, genre: f.genre, gross: fmt(box.totalGross), budget: fmt(f.budget) }, state.year, state.month, newspaperEdition);
          if (sleeperNews) {
            sleeperNews.headline = `INDIE GEM "${f.title.toUpperCase()}" DEFIES ALL EXPECTATIONS`;
            sleeperNews.subhead = `${fmt(f.budget)} film earns ${fmt(box.totalGross)} on word of mouth alone`;
            newspaperQueue.push(sleeperNews);
          }
        }

        // NEWSPAPER: Box office milestones and major flops
        const newsData = { film: f.title, studio: state.studioName, genre: f.genre, budget: fmt(f.budget), gross: fmt(box.totalGross), loss: fmt(Math.abs(box.profit)) };
        if (box.totalGross >= 1e9) {
          newspaperEdition++;
          const n = makeNewspaper('box_office_1b', newsData, state.year, state.month, newspaperEdition);
          if (n) newspaperQueue.push(n);
          celebration = { type: 'fireworks', color: 'gold', message: 'BILLION DOLLAR CLUB!' };
        } else if (box.totalGross >= 500e6) {
          newspaperEdition++;
          const n = makeNewspaper('box_office_500m', newsData, state.year, state.month, newspaperEdition);
          if (n) newspaperQueue.push(n);
        } else if (box.totalGross >= 100e6) {
          newspaperEdition++;
          const n = makeNewspaper('box_office_100m', newsData, state.year, state.month, newspaperEdition);
          if (n) newspaperQueue.push(n);
        }
        if (box.profit < 0 && f.budget >= 50e6 && box.totalGross < f.budget * 0.5) {
          newspaperEdition++;
          const n = makeNewspaper('major_flop', newsData, state.year, state.month, newspaperEdition);
          if (n) newspaperQueue.push(n);
        }

        // Reputation & prestige
        if (box.totalGross > 100000000) rep += 3;
        if (box.totalGross > 500000000) rep += 5;
        if (box.criticScore > 80) pres += 3;
        if (box.criticScore > 90) { pres += 5; }
        if (f.quality >= 85) { pres += 3; }
        // Window prestige bonus (awards season releases)
        if (window && window.prestigeBonus) pres += window.prestigeBonus;
        // Trait prestige
        const dTrait = f.director.traitEffect || {}, aTrait = f.actor.traitEffect || {};
        if (dTrait.prestigeBonus) pres += dTrait.prestigeBonus;
        if (aTrait.prestigeBonus) pres += aTrait.prestigeBonus;
        // Coalition prestige bonus
        const indieCoal = state.playerCoalition ? INDUSTRY_COALITIONS.find(c => c.id === state.playerCoalition) : null;
        if (indieCoal?.effect?.prestigeBonus) pres += indieCoal.effect.prestigeBonus;
        // Franchise gross
        if (f.franchiseId !== null) {
          franchises = franchises.map(fr =>
            fr.id === f.franchiseId ? { ...fr, totalGross: fr.totalGross + box.totalGross } : fr
          );
        }

        return f;
      });

      // 3. Monthly expenses
      let salaryExpense = state.contracts.reduce((sum, t) => sum + Math.round(t.salary / 12), 0);
      // Apply coalition talent cost multiplier
      const talentCostCoal = state.playerCoalition ? INDUSTRY_COALITIONS.find(c => c.id === state.playerCoalition) : null;
      if (talentCostCoal?.effect?.talentCostMult) {
        salaryExpense = Math.round(salaryExpense * talentCostCoal.effect.talentCostMult);
      }
      const overhead = 50000 + state.facilitiesLevel * 30000; // scales: $80K at lvl1, $230K at lvl6
      expenses = salaryExpense + overhead;

      // Studio lot upkeep and rental income
      const ownedLots = state.studioLots || [];
      let lotUpkeep = 0, lotRental = 0;
      ownedLots.forEach(owned => {
        const lot = STUDIO_LOTS.find(l => l.id === owned.id);
        if (lot) {
          lotUpkeep += lot.monthlyUpkeep;
          if (!owned.inUse) lotRental += lot.rentalIncome; // only earn rent if not using it
        }
      });
      expenses += lotUpkeep;
      revenue += lotRental;

      // 4. Streaming revenue
      if (streaming) {
        const growth = 1 + (Math.random() * 0.03 + 0.01); // 1-4% monthly growth
        streaming.subscribers = Math.round(streaming.subscribers * growth);
        let streamRev = Math.round(streaming.subscribers * 1); // $1/subscriber/month
        // Apply streaming coalition multiplier
        const streamCoal = state.playerCoalition ? INDUSTRY_COALITIONS.find(c => c.id === state.playerCoalition) : null;
        if (streamCoal?.effect?.streamingRevMult) {
          streamRev = Math.round(streamRev * streamCoal.effect.streamingRevMult);
        }
        revenue += streamRev;
      }

      // 5. Licensing window revenue (replaces old home video)
      let licensingRev = 0;
      films.forEach(f => {
        if (f.status !== 'released' || f.soldRights) return;
        const monthsSinceRelease = (state.year - f.releasedYear) * 12 + (state.month - f.releasedMonth);
        LICENSING_WINDOWS.forEach(w => {
          if (monthsSinceRelease >= w.monthsAfterRelease && monthsSinceRelease < w.monthsAfterRelease + w.duration) {
            // Time decay: revenue drops 3% per year after release
            const yearsOut = monthsSinceRelease / 12;
            const decayFactor = Math.max(0.15, Math.pow(0.97, yearsOut));
            const monthlyRev = Math.round(f.totalGross * w.revenuePct / 12 * decayFactor);
            licensingRev += monthlyRev;
            f.licensingRevenue = (f.licensingRevenue || 0) + monthlyRev;
          }
        });
      });
      // Market saturation: cap total passive licensing revenue at 2x active box office revenue
      licensingRev = Math.min(licensingRev, Math.max(tGross * 2, 2000000));
      revenue += licensingRev;

      // 5b. Theme park revenue
      let themeParks = (state.themeParks || []).map(p => ({ ...p }));
      themeParks.forEach(park => {
        if (park.turnsLeft > 0) {
          park.turnsLeft -= 1;
          if (park.turnsLeft <= 0) {
            park.operational = true;
            log.push({ text: `${park.name} is now OPEN! Generating ${fmt(park.monthlyRevenue)}/month.`, type: 'success', category: 'market' });
          }
        }
        if (park.operational) {
          revenue += park.monthlyRevenue;
        }
      });

      // 5c. Merchandise revenue from franchises
      const merchRev = calcMerchandiseRevenue(franchises, films);
      if (merchRev > 0) revenue += merchRev;

      // 5d. Theater chain ticket cut revenue (cut of all industry gross)
      const totalTheaterCut = theaterChains.reduce((sum, c) => sum + c.ticketCut, 0);
      if (totalTheaterCut > 0) {
        const industryGross = tGross * 0.01 + state.competitors.reduce((s, c) => s + c.totalGross * 0.001, 0);
        revenue += Math.round(industryGross * totalTheaterCut);
      }

      // 5e. TV Show Pipeline
      let tvShows = (state.tvShows || []).map(s => ({ ...s, events: [...(s.events || [])] }));
      tvShows = tvShows.map(show => {
        if (show.status === 'cancelled' || show.status === 'ended') return show;
        const s = { ...show };
        s.turnsInStatus = (s.turnsInStatus || 0) + 1;

        if (s.status === 'development' && s.turnsInStatus >= s.turnsNeeded) {
          s.status = 'production';
          s.turnsInStatus = 0;
          s.turnsNeeded = s.prodTurns || Math.ceil(s.episodes / 3);
          s.events.push(`S${s.currentSeason} entered production`);
          log.push({ text: `"${s.title}" S${s.currentSeason} entered production.`, type: 'info', category: 'streaming' });
        } else if (s.status === 'production' && s.turnsInStatus >= s.turnsNeeded) {
          s.status = 'airing';
          s.turnsInStatus = 0;
          s.turnsNeeded = s.episodes;
          s.seasons = s.currentSeason;

          const showrunner = state.contracts.find(t => t.id === s.showrunnerId);
          let q = (showrunner ? showrunner.skill * 0.5 : 30) + randInt(10, 30);
          const format = TV_FORMATS.find(f => f.id === s.format);
          if (format) q *= format.qualityWeight;
          if (showrunner?.traitEffect?.qualityBonus) {
            const traitGenres = showrunner.traitEffect.genres || [];
            if (traitGenres.includes(s.formatName)) q += showrunner.traitEffect.qualityBonus;
          }
          if (s.currentSeason > 2 && !(showrunner?.traitEffect?.noSeasonDecay)) {
            q -= (s.currentSeason - 2) * 4;
          }
          const genreId = (state.genreIdentity || {})[s.formatName?.split(' ')[0]];
          if (genreId && genreId.reputation > 30) q += 5;
          if (Math.random() < 0.05) {
            const scandal = pick(PRODUCTION_SCANDALS);
            q += scandal.qualityHit;
            s.events.push(`SCANDAL: ${scandal.name}`);
            rep += scandal.repChange;
            log.push({ text: `SCANDAL on "${s.title}" S${s.currentSeason}: ${scandal.desc}`, type: 'warning', category: 'streaming' });
          }

          s.quality = Math.round(clamp(q, 10, 98));
          s.criticScore = clamp(s.quality + randInt(-10, 10), 5, 100);
          s.audienceScore = clamp(Math.round(s.quality * 0.85 + randInt(-5, 15)), 10, 100);

          let viewerBase = s.quality * 10000 + randInt(50000, 500000);
          if (format) viewerBase *= format.audienceBase;
          if (showrunner?.traitEffect?.viewershipBonus) viewerBase *= (1 + showrunner.traitEffect.viewershipBonus);
          s.viewership = Math.round(viewerBase);

          const isStreamingExclusive = s.releaseStrategy === 'streaming_exclusive' || s.releaseStrategy === 'hybrid';
          if (isStreamingExclusive && streaming) {
            let subBoost = Math.round(s.viewership * 0.1 * (s.quality / 50));
            if (showrunner?.traitEffect?.subscriberBonus) subBoost = Math.round(subBoost * (1 + showrunner.traitEffect.subscriberBonus));
            s.subscriberImpact = subBoost;
            s.monthlyRevenue = 0;
          } else {
            s.monthlyRevenue = Math.round(s.viewership * 0.5 + s.quality * 5000);
          }

          s.criticReviews = (FILM_CRITICS || []).slice(0, 5).map(critic => {
            let score = s.quality;
            const baseGenre = s.formatName?.split(' ')[0] || 'Drama';
            if (critic.genreLove?.includes(baseGenre)) score += 10;
            if (critic.genreHate?.includes(baseGenre)) score -= 12;
            score += (Math.random() - 0.5) * 15;
            score = Math.round(clamp(score, 5, 100));
            let verdict;
            if (score >= 80) verdict = pick(['Must-watch TV', 'Brilliant series', 'Peak television']);
            else if (score >= 60) verdict = pick(['Solid show', 'Worth binging', 'Good television']);
            else if (score >= 40) verdict = pick(['Has its moments', 'Uneven but watchable']);
            else verdict = pick(['Skip this one', 'Disappointing', 'Below par']);
            return { name: critic.name, publication: critic.publication, score, verdict };
          });

          log.push({ text: `"${s.title}" S${s.currentSeason} premieres! Quality: ${s.quality} | Viewers: ${(s.viewership/1e6).toFixed(1)}M${s.subscriberImpact > 0 ? ` | +${(s.subscriberImpact/1e6).toFixed(1)}M subs` : ''}`, type: 'success', category: 'streaming' });
          turnSummaryData.streaming.push({ text: `"${s.title}" S${s.currentSeason} premieres — Quality: ${s.quality}, Viewers: ${(s.viewership/1e6).toFixed(1)}M` });
          s.events.push(`S${s.currentSeason} premiered (Q:${s.quality})`);
        } else if (s.status === 'airing') {
          revenue += s.monthlyRevenue;

          if (streaming && s.subscriberImpact > 0) {
            const monthlySubGain = Math.round(s.subscriberImpact / Math.max(s.turnsNeeded, 1));
            streaming.subscribers = (streaming.subscribers || 0) + monthlySubGain;
          }

          if (s.turnsInStatus >= s.turnsNeeded) {
            s.status = s.currentSeason >= (TV_FORMATS.find(f => f.id === s.format)?.maxSeasons || 99) ? 'ended' : 'airing';
            s.events.push(`S${s.currentSeason} finished airing`);
            if (s.quality < 35 && Math.random() < 0.4) {
              log.push({ text: `"${s.title}" S${s.currentSeason} had poor ratings. Consider cancellation.`, type: 'warning', category: 'streaming' });
            }
          }
        }
        return s;
      });

      // 5e2. Streaming Platform Economics
      if (streaming) {
        const tierData = STREAMING_TIERS.find(t => t.id === streaming.tier) || STREAMING_TIERS[1];

        const catalogFilmCount = (streaming.catalogFilmIds || []).length;
        const catalogShowCount = (streaming.catalogShowIds || []).length;
        const licensedIn = (state.licensingDeals || []).filter(d => d.type === 'in' && d.monthsLeft > 0).length;
        streaming.contentLibrary = catalogFilmCount + catalogShowCount + licensedIn;
        streaming.tvContentCount = catalogShowCount;

        const catalogFilmSet = new Set(streaming.catalogFilmIds || []);
        const catalogShowSet = new Set(streaming.catalogShowIds || []);
        const catalogFilms = films.filter(f => f.status === 'released' && catalogFilmSet.has(f.id));
        const ipContentCount = catalogFilms.filter(f => f.isIP).length;
        const contentQuality = [
          ...catalogFilms.map(f => f.quality || 50),
          ...tvShows.filter(s => catalogShowSet.has(s.id)).map(s => s.quality || 50),
        ];
        let avgContentQuality = contentQuality.length > 0 ? contentQuality.reduce((a, b) => a + b, 0) / contentQuality.length : 40;
        // IP content boosts perceived quality and subscriber appeal
        if (ipContentCount > 0) {
          const ipBoost = Math.min((ipContentCount / Math.max(catalogFilms.length, 1)) * 10, 5);
          avgContentQuality += ipBoost;
        }

        const marketingBoost = Math.min((streaming.marketingSpend || 0) / 10e6, 0.5);
        const contentBoost = Math.min(streaming.contentLibrary * 0.002, 0.3);
        const qualityBoost = (avgContentQuality - 40) * 0.005;
        const baseGrowthRate = 0.02 + marketingBoost + contentBoost + qualityBoost;
        const churn = streaming.churnRate || tierData.churnRate;
        const netGrowth = Math.max(baseGrowthRate - churn, -0.05);

        if (streaming.subscribers === 0 && streaming.launchYear === state.year) {
          streaming.subscribers = Math.round(500000 + (state.reputation * 20000) + (streaming.marketingSpend || 0) / 10);
        }

        const prevSubs = streaming.subscribers;
        streaming.subscribers = Math.round(Math.max(0, streaming.subscribers * (1 + netGrowth)));
        streaming.marketingSpend = Math.round((streaming.marketingSpend || 0) * 0.8);

        // NEWSPAPER: Streaming subscriber milestones
        const subMilestones = [100e6, 50e6, 10e6];
        subMilestones.forEach(milestone => {
          if (streaming.subscribers >= milestone && prevSubs < milestone) {
            newspaperEdition++;
            const label = milestone >= 1e6 ? `${Math.round(milestone / 1e6)}M` : milestone.toLocaleString();
            const sn = makeNewspaper('subscribers_milestone', { studio: state.studioName, count: label }, state.year, state.month, newspaperEdition);
            if (sn) newspaperQueue.push(sn);
            if (milestone === 100e6) celebration = { type: 'confetti', color: 'green', message: '100M SUBSCRIBERS!' };
          }
        });

        const subRevenue = Math.round(streaming.subscribers * tierData.monthlyPrice);
        const adRevenue = streaming.adTier ? Math.round(streaming.subscribers * 0.3 * tierData.adRevPerSub) : 0;
        streaming.monthlyRevenue = subRevenue + adRevenue;
        revenue += streaming.monthlyRevenue;

        const streamHist = [...(state.streamingHistory || [])];
        streamHist.push({ turn: state.turn, subscribers: streaming.subscribers, revenue: streaming.monthlyRevenue, churn: Math.round(churn * 100), contentCount: streaming.contentLibrary });
      }

      // 5e2b. Rival Streamers — spawn new ones as their founding year arrives, grow/shrink existing
      let rivalStreamers = (state.rivalStreamers || []).map(rs => ({ ...rs }));
      if (state.year >= 2005) {
        // Spawn new rival streamers when their founding year arrives
        RIVAL_STREAMERS.forEach(def => {
          if (def.founded === state.year && state.month === 1 && !rivalStreamers.find(rs => rs.name === def.name)) {
            const newRival = {
              ...def,
              subscribers: Math.round(def.baseSubscribers * 0.1),
              contentCount: randInt(10, 40),
              quality: randInt(55, 75),
            };
            rivalStreamers.push(newRival);
            log.push({ text: `New streaming platform "${def.name}" has launched! ${def.desc}`, type: 'info', category: 'streaming' });
          }
        });
        // Update existing rivals: grow/shrink based on age and quality
        rivalStreamers = rivalStreamers.map(rs => {
          const age = state.year - rs.founded;
          const maturity = Math.min(age / 5, 1); // reaches maturity in ~5 years
          const targetSubs = rs.baseSubscribers * maturity;
          const growthRate = rs.subscribers < targetSubs ? 0.03 + Math.random() * 0.02 : -0.01 + Math.random() * 0.02;
          rs.subscribers = Math.round(Math.max(100000, rs.subscribers * (1 + growthRate)));
          rs.contentCount += randInt(1, 5);
          rs.quality = clamp(rs.quality + randInt(-2, 2), 40, 90);
          return rs;
        });
      }

      // 5e3. Content licensing deal processing
      let licensingDeals = (state.licensingDeals || []).map(d => ({ ...d }));
      licensingDeals = licensingDeals.map(d => {
        const deal = { ...d, monthsLeft: d.monthsLeft - 1 };
        if (deal.type === 'out') {
          revenue += deal.monthlyFee;
        } else if (deal.type === 'in') {
          expenses += deal.monthlyFee;
        }
        return deal;
      }).filter(d => d.monthsLeft > 0);

      // 5f. Soundtrack revenue (small passive from all released films)
      const soundtrackRev = Math.round(films.filter(f => f.status === 'released').length * 15000);
      revenue += soundtrackRev;

      // Talent contracts (declared early so academy graduates can push to it)
      let contracts = state.contracts.map(t => ({ ...t }));

      // 5g. Talent academy progress
      let academy = state.academy.map(a => ({ ...a }));
      const graduatedTrainees = [];
      academy = academy.map(trainee => {
        const t = { ...trainee, turnsLeft: trainee.turnsLeft - 1 };
        t.skill = clamp(t.skill + randInt(2, 5), 0, t.potential);
        if (t.turnsLeft <= 0) {
          graduatedTrainees.push(t);
        }
        return t;
      });
      academy = academy.filter(t => t.turnsLeft > 0);
      // Graduate trainees into contracts
      graduatedTrainees.forEach(t => {
        const newTalent = makeTalent(state.nextId + graduatedTrainees.indexOf(t) + 20, t.type, [t.skill - 5, t.skill + 5]);
        newTalent.name = t.name;
        newTalent.salary = Math.round(newTalent.salary * 0.6); // academy grads are cheaper
        contracts.push(newTalent);
        log.push({ text: `Academy graduate ${t.name} (${t.type}, skill ${t.skill}) joins your studio!`, type: 'success', category: 'talent' });
      });

      // 6. Apply cash changes
      cash += revenue - expenses;

      // 7. Natural decay
      rep = clamp(rep - 1, 0, 100);
      pres = clamp(pres - 1, 0, 100);

      // 8. Check milestones
      if (tAwards >= 3 && !milestones.indieDarling) {
        milestones.indieDarling = true;
        log.push({ text: '🏆 MILESTONE ACHIEVED: Indie Darling — Won 3+ awards!', type: 'award' });
      }
      if (tGross >= 1e9 && !milestones.boxOfficeKing) {
        milestones.boxOfficeKing = true;
        log.push({ text: '🏆 MILESTONE ACHIEVED: Box Office King — $1B total gross!', type: 'award' });
      }
      const bigFranchise = franchises.find(fr => fr.filmIds.length >= 3);
      if (bigFranchise && !milestones.franchiseBuilder) {
        milestones.franchiseBuilder = true;
        log.push({ text: '🏆 MILESTONE ACHIEVED: Franchise Builder — 3+ films in a franchise!', type: 'award' });
      }
      if (cash >= 500000000 && state.facilitiesLevel >= 5 && !milestones.studioMogul) {
        milestones.studioMogul = true;
        log.push({ text: '🏆 MILESTONE ACHIEVED: Studio Mogul — $500M cash + max facilities!', type: 'award' });
      }
      if (streaming && streaming.subscribers >= 10000000 && !milestones.streamingPioneer) {
        milestones.streamingPioneer = true;
        log.push({ text: '🏆 MILESTONE ACHIEVED: Streaming Pioneer — 10M subscribers!', type: 'award' });
      }
      const allMilestones = milestones.indieDarling && milestones.boxOfficeKing && milestones.franchiseBuilder && milestones.studioMogul && milestones.streamingPioneer;
      if (allMilestones && !milestones.hollywoodLegend) {
        milestones.hollywoodLegend = true;
        log.push({ text: '🌟 MILESTONE ACHIEVED: Hollywood Legend — You\'ve done it all!', type: 'award' });
      }

      // 8b. Check achievements
      let unlockedAchievements = [...state.unlockedAchievements];
      const updatedState = {
        ...state,
        films,
        totalFilmsReleased,
        cash,
        reputation: clamp(Math.round(rep), 0, 100),
        prestige: clamp(Math.round(pres), 0, 100),
        awards,
        franchises,
        streamingPlatform: streaming,
        turn: state.turn + 1,
      };
      const newAchievements = ACHIEVEMENTS.filter(
        a => !unlockedAchievements.includes(a.id) && a.check(updatedState)
      );
      newAchievements.forEach(a => {
        unlockedAchievements.push(a.id);
        log.push({ text: `Achievement Unlocked: ${a.name} — ${a.desc}`, type: 'award' });
      });

      // 8c. Awards Season — Multiple real ceremonies throughout the year
      let annualAwards = [...state.annualAwards];
      let pendingCeremony = null;
      const currentMonth = state.month;
      const prevYear = currentMonth <= 3 ? state.year - 1 : state.year; // Awards season covers Jan-Mar for prev year's films

      // Find award shows happening this month
      const showsThisMonth = AWARD_SHOWS.filter(show => show.month === currentMonth);
      if (showsThisMonth.length > 0 && state.turn > 0) {
        // Pull all films from permanent history for the award year
        const awardYear = currentMonth <= 6 ? state.year - 1 : state.year;
        const allYearFilms = (state.allFilmHistory || []).filter(f => f.releasedYear === awardYear);
        const playerYearFilms = films.filter(f => f.status === 'released' && f.releasedYear === awardYear)
          .map(f => ({ ...f, studio: state.studioName, isRival: false }));
        const historyTitles = new Set(allYearFilms.map(f => f.title + '|' + f.studio));
        const missingPlayerFilms = playerYearFilms.filter(f => !historyTitles.has(f.title + '|' + f.studio));
        const combinedYearFilms = [...allYearFilms, ...missingPlayerFilms];

        if (combinedYearFilms.length > 0) {
          // Apply awards campaign spending boosts
          const campaignBoostedFilms = combinedYearFilms.map(f => {
            if (f.isRival) {
              const rivalCampaign = f.quality >= 75 ? Math.round(f.budget * 0.05 * Math.random()) : 0;
              const rivalBoost = Math.min(Math.sqrt(rivalCampaign / 1e6) * 3, 8);
              return { ...f, _awardsBoost: rivalBoost };
            }
            const campaign = (state.awardsCampaigns || {})[f.id] || 0;
            const detailedCampaign = (state.awardsCampaignsDetailed || {})[f.id];
            const campaignSpent = detailedCampaign ? detailedCampaign.spent : campaign;
            const effectMult = detailedCampaign ? detailedCampaign.effectMult : 1;
            const boost = Math.min(Math.sqrt(campaignSpent / 1e6) * 5 * effectMult, 15);
            return { ...f, _awardsBoost: boost };
          });

          // Process each show this month
          const allShowResults = [];
          showsThisMonth.forEach(show => {
            const showData = { showId: show.id, showName: show.name, shortName: show.shortName, icon: show.icon, year: awardYear, isNegative: show.isNegative || false, categories: [] };
            show.categories.forEach(cat => {
              const nominees = generateNominees(campaignBoostedFilms, cat, show.id);
              if (nominees.length > 0) {
                const winner = nominees[0];
                showData.categories.push({
                  name: cat.name,
                  icon: cat.icon,
                  nominees,
                  winner: winner.title,
                  winnerStudio: winner.studio,
                  isRivalWin: winner.isRival,
                  prestigeBonus: cat.prestigeBonus || 0,
                });
                // Only count player wins
                if (!winner.isRival) {
                  if (!show.isNegative) {
                    tAwards += 1;
                    pres += cat.prestigeBonus || 2;
                    rep += show.reputationBonus > 0 ? 1 : 0;
                    awards.push({ year: awardYear, film: winner.title, type: cat.name, show: show.shortName });
                    const awardDialogue = getTalentDialogue('award_win', null);
                    if (awardDialogue) log.push({ text: `💬 "${awardDialogue}" — ${winner.title} team`, type: 'dialogue' });
                  } else {
                    // Razzies — negative prestige
                    pres += cat.prestigeBonus || 0;
                    rep -= 1;
                    awards.push({ year: awardYear, film: winner.title, type: cat.name, show: show.shortName, isRazzie: true });
                  }
                }
              }
            });
            allShowResults.push(showData);
            const playerWins = showData.categories.filter(c => !c.isRivalWin).length;
            const totalCats = showData.categories.length;
            if (show.isNegative) {
              const playerRazzies = showData.categories.filter(c => !c.isRivalWin).length;
              if (playerRazzies > 0) {
                log.push({ text: `${show.icon} ${show.shortName} ${awardYear}: Your studio "won" ${playerRazzies} Razzie(s). Ouch.`, type: 'warning' });
              }
            } else if (playerWins > 0) {
              log.push({ text: `${show.icon} ${show.shortName} ${awardYear}: Your studio won ${playerWins}/${totalCats} awards!`, type: 'award' });
            } else {
              log.push({ text: `${show.icon} ${show.shortName} ${awardYear} ceremony concluded. No wins for your studio.`, type: 'info' });
            }
            // Store in annual awards
            annualAwards.push({
              year: awardYear,
              showId: show.id,
              showName: show.shortName,
              showIcon: show.icon,
              isNegative: show.isNegative || false,
              awards: showData.categories.map(c => ({ category: c.name, film: c.winner, studio: c.winnerStudio, isRivalWin: c.isRivalWin })),
            });
          });

          // Set pending ceremony to show all shows this month
          pendingCeremony = { year: awardYear, shows: allShowResults };

          // NEWSPAPER: Award sweeps (3+ wins at a major show)
          allShowResults.forEach(showRes => {
            if (showRes.isNegative) return;
            const playerWinsCount = showRes.categories.filter(c => !c.isRivalWin).length;
            const bestPicture = showRes.categories.find(c => c.name === 'Best Picture' && !c.isRivalWin);
            if (playerWinsCount >= 3 || bestPicture) {
              newspaperEdition++;
              const topFilm = bestPicture ? bestPicture.winner : showRes.categories.find(c => !c.isRivalWin)?.winner || 'Unknown';
              const n = makeNewspaper('award_sweep', {
                studio: state.studioName, film: topFilm, count: playerWinsCount, show: showRes.showName,
              }, state.year, state.month, newspaperEdition);
              if (n) newspaperQueue.push(n);
              if (!celebration) celebration = { type: 'confetti', color: 'gold', message: 'AWARDS GLORY!' };
            }
          });
        }
      }

      // 8d. Build monthly box office chart (player + rival films)
      const thisQFilms = films.filter(f => f.status === 'released' && f.releasedYear === state.year && f.releasedMonth === state.month);
      const rivalEntries = (state.rivalFilms || []).map(rf => ({ title: rf.title, studio: rf.studio, gross: rf.gross }));
      const playerEntries = thisQFilms.map(f => ({ title: f.title, studio: state.studioName, gross: f.totalGross }));
      const boxOfficeChart = [...playerEntries, ...rivalEntries].sort((a, b) => b.gross - a.gross).slice(0, 10);

      // 8e. Endgame check — if year >= 2200, trigger legacy screen
      let phase = state.phase;
      let legacyScore = 0;
      if (state.year >= 2200 && state.month === 12) {
        legacyScore = calcLegacyScore({ ...state, films, totalGross: tGross, totalAwards: tAwards, prestige: pres, reputation: rep, totalFilmsReleased, franchises, streamingPlatform: streaming, unlockedAchievements, milestones });
        phase = 'legacy';
        log.push({ text: `The year is ${state.year}. Your studio's legacy has been written. Final score: ${legacyScore}`, type: 'award' });
      }

      // 8f. Specialization prestige bonus per released film
      const specBonus = SPECIALIZATIONS[state.specialization]?.bonus || {};
      if (specBonus.prestigeBonus && thisQFilms.length > 0) {
        pres += specBonus.prestigeBonus * thisQFilms.length;
      }

      // 9. Loan interest payments
      let loans = state.loans.map(l => ({ ...l }));
      loans.forEach(loan => {
        const interest = Math.round(loan.principal * loan.interestRate);
        cash -= interest;
        expenses += interest;
        loan.remainingMonths -= 1;
      });
      // Remove expired loans (paid off over time)
      const expiredLoans = loans.filter(l => l.remainingMonths <= 0);
      expiredLoans.forEach(l => {
        cash -= l.principal;
        expenses += l.principal;
        log.push({ text: `${l.name} matured — principal ${fmt(l.principal)} repaid.`, type: 'warning' });
      });
      loans = loans.filter(l => l.remainingMonths > 0);

      // 9b. Distribution deal countdown
      let distDeal = state.distributionDeal;
      let distTurns = state.distributionTurnsLeft;
      if (distDeal && distTurns > 0) {
        distTurns -= 1;
        if (distTurns <= 0) {
          log.push({ text: `Your ${distDeal.name} distribution deal has expired.`, type: 'info' });
          distDeal = null;
        }
      }

      // 10. Talent aging & drama (every December = end of year)
      if (state.month === 12) {
        contracts = contracts.map(t => {
          const updated = { ...t, age: t.age + 1, contractYears: t.contractYears - 1 };
          // Skill evolution by age
          if (updated.age < 25) {
            updated.skill = clamp(updated.skill + randInt(1, 4), 0, 99); // prodigies improve fast
          } else if (updated.age < 35) {
            updated.skill = clamp(updated.skill + randInt(0, 3), 0, 99); // young talent improves
          } else if (updated.age < 50) {
            updated.skill = clamp(updated.skill + randInt(-1, 1), 0, 99); // prime years — stable
          } else if (updated.age < 65) {
            updated.skill = clamp(updated.skill - randInt(0, 2), 10, 99); // gradual decline
          } else {
            updated.skill = clamp(updated.skill - randInt(1, 4), 10, 99); // steep late-career decline
          }
          // Morale drift toward 65
          updated.morale = clamp(updated.morale + randInt(-5, 5), 20, 100);
          return updated;
        });
        // Retirement check — starts at 65, increasingly likely after
        const retirees = contracts.filter(t => t.age >= 65 && Math.random() < (t.age - 60) * 0.08);
        retirees.forEach(t => {
          log.push({ text: `${t.name} (${t.type}, age ${t.age}) has retired from the industry.`, type: 'warning', category: 'talent' });
          turnSummaryData.talent.push({ text: `${t.name} (${t.type}, age ${t.age}) has retired` });
        });
        const retireeIds = new Set(retirees.map(t => t.id));
        contracts = contracts.filter(t => !retireeIds.has(t.id));
        // Contract expiry
        const expired = contracts.filter(t => t.contractYears <= 0);
        expired.forEach(t => {
          log.push({ text: `${t.name}'s contract has expired. Re-sign them or they'll leave.`, type: 'warning', category: 'talent' });
          t.contractYears = 0; // mark for re-sign (player can still use them this turn)
        });
      }

      // 10b. Talent drama (10% chance per month)
      if (contracts.length > 0 && Math.random() < 0.10) {
        const drama = pick(TALENT_DRAMAS);
        const target = pick(contracts);
        let dramaText = drama.text.replace('{name}', target.name);
        switch (drama.type) {
          case 'demand_raise':
            target.salary = Math.round(target.salary * 1.25);
            target.morale = clamp(target.morale - 5, 20, 100);
            break;
          case 'feud':
            if (contracts.length >= 2) {
              const other = pick(contracts.filter(t => t.id !== target.id));
              dramaText = dramaText.replace('{name2}', other.name);
              target.morale = clamp(target.morale - 15, 20, 100);
              other.morale = clamp(other.morale - 15, 20, 100);
            } else {
              dramaText = `${target.name} is frustrated with studio conditions. -10 morale.`;
              target.morale = clamp(target.morale - 10, 20, 100);
            }
            break;
          case 'indie_award':
            target.popularity = clamp(target.popularity + 15, 10, 99);
            target.morale = clamp(target.morale + 5, 20, 100);
            break;
          case 'social_buzz':
            target.popularity = clamp(target.popularity + 10, 10, 99);
            break;
          case 'burnout':
            target.morale = clamp(target.morale - 20, 20, 100);
            break;
          case 'mentor':
            if (contracts.length >= 2) {
              const junior = pick(contracts.filter(t => t.id !== target.id));
              junior.skill = clamp(junior.skill + 3, 0, 99);
              target.morale = clamp(target.morale + 5, 20, 100);
              dramaText += ` ${junior.name} gains +3 skill.`;
            }
            break;
          case 'hot_streak':
            target.skill = clamp(target.skill + 5, 0, 99);
            break;
          case 'controversy':
            target.popularity = clamp(target.popularity - 10, 10, 99);
            rep -= 3;
            break;
          case 'poached':
            if (contracts.length > 1) {
              contracts = contracts.filter(t => t.id !== target.id);
            } else {
              dramaText = `${target.name} considered leaving but decided to stay. Close call!`;
              target.morale = clamp(target.morale - 5, 20, 100);
            }
            break;
          default: break;
        }
        log.push({ text: `DRAMA: ${dramaText}`, type: 'warning' });
      }

      // 11. ENHANCED: Rival studio competition with AI learning systems
      // Calculate player market share by genre
      const releasedPlayerFilms = films.filter(f => f.status === 'released');
      const playerGenreShare = {};
      GENRES.forEach(g => {
        const playerCount = releasedPlayerFilms.filter(f => f.genre === g).length;
        const totalCount = Math.max(1, playerCount + (state.allFilmHistory || []).filter(f => f.genre === g && f.isRival).length);
        playerGenreShare[g] = playerCount / totalCount;
      });

      // Adaptive difficulty - scale with player dominance
      let difficultyScale = state.difficultyScale || 1.0;
      const playerRep = rep;
      const avgRivalRep = state.competitors.length > 0 ? state.competitors.reduce((s, c) => s + c.reputation, 0) / state.competitors.length : 50;
      if (playerRep > avgRivalRep + 20) difficultyScale = clamp(difficultyScale + 0.02, 1.0, 2.0);
      else if (playerRep < avgRivalRep - 10) difficultyScale = clamp(difficultyScale - 0.01, 0.8, 2.0);

      let competitors = state.competitors.map(c => ({ ...c, releasesThisQ: 0, personality: c.personality ? { ...c.personality, genreWeights: { ...(c.personality.genreWeights || {}) } } : c.personality }));
      const rivalFilmsThisQ = [];
      const usedTitlesThisTurn = new Set((state.rivalFilmsThisYear || []).map(f => f.title));

      competitors.forEach(comp => {
        // Personality-driven release chance — rivals release 1-3 films per year on average
        const releaseChance = comp.personality ? 0.08 + comp.personality.aggression * 0.10 : 0.12;
        if (Math.random() < releaseChance) {
          // ENHANCED: Strategic genre selection with counter-programming
          let genre;
          const rivalStrategy = state.rivalStrategies?.[comp.name] || {};

          // 30% chance to counter-program against player's current productions
          if (Math.random() < 0.3 * difficultyScale) {
            const playerInDev = films.filter(f => ['development', 'production'].includes(f.status));
            if (playerInDev.length > 0) {
              const targetFilm = pick(playerInDev);
              genre = targetFilm.genre;
              comp._counterTarget = targetFilm.title;
            }
          }
          // 25% chance to copy player's successful strategy with delay
          if (!genre && Math.random() < 0.25 * difficultyScale) {
            const recentHits = films.filter(f => f.status === 'released' && f.profit > 0 && f.releasedYear >= state.year - 3);
            if (recentHits.length > 0) {
              const hitGenres = {};
              recentHits.forEach(f => { hitGenres[f.genre] = (hitGenres[f.genre] || 0) + 1; });
              const topGenre = Object.entries(hitGenres).sort((a, b) => b[1] - a[1])[0];
              if (topGenre) genre = topGenre[0];
            }
          }
          // 20% chance to exploit gap
          if (!genre && Math.random() < 0.2) {
            const underserved = GENRES.filter(g => (playerGenreShare[g] || 0) < 0.05);
            if (underserved.length > 0) genre = pick(underserved);
          }
          // Otherwise use personality weights
          if (!genre) {
            if (comp.personality && comp.personality.genreWeights) {
              const weights = Object.entries(comp.personality.genreWeights);
              const totalW = weights.reduce((s, [, w]) => s + w, 0);
              let r = Math.random() * totalW;
              genre = GENRES[0];
              for (const [g, w] of weights) { r -= w; if (r <= 0) { genre = g; break; } }
            } else { genre = pick(GENRES); }
          }

          const pBonus = comp.personality ? comp.personality.qualityBonus : 0;
          let quality = clamp(randInt(35, 88) + Math.round(comp.reputation * 0.1) + pBonus, 25, 96);
          const bMult = comp.personality ? comp.personality.budgetMult : 1;
          let budget = Math.round(randInt(10, 100) * 1e6 * bMult);
          const mMult = comp.personality ? comp.personality.marketingMult : 1;
          // Apply AI content tax if regulation active
          const hasAITax = (state.activeRegulations || []).some(r => r.id === 'ai_content_tax');
          if (hasAITax && comp.isAI) {
            quality = Math.max(25, Math.round(quality * 0.75)); // Reduce quality by 25%
            budget = Math.round(budget * 1.25); // Increase costs by 25%
          }
          let gross = Math.round(budget * (quality >= 75 ? 3.0 : quality >= 55 ? 1.5 : 0.5) * (1 + Math.random()) * mMult);
          const availableTitles = RIVAL_FILM_TITLES.filter(t => !usedTitlesThisTurn.has(t));
          const title = availableTitles.length > 0 ? pick(availableTitles) : `${pick(RIVAL_FILM_TITLES)}: ${pick(['Reborn','Unleashed','Redux','Returns','Rising','Legacy','Untold','Chronicles','Awakening'])}`;
          usedTitlesThisTurn.add(title);
          const directorName = pick(RIVAL_DIRECTOR_NAMES);
          const actorName = pick(RIVAL_ACTOR_NAMES);
          const writerName = pick(RIVAL_WRITER_NAMES);
          const directorSkill = clamp(quality + randInt(-15, 10), 30, 98);
          const actorSkill = clamp(quality + randInt(-10, 15), 30, 98);
          const writerSkill = clamp(quality + randInt(-12, 12), 30, 98);
          const criticScore = clamp(Math.round(quality + (Math.random() - 0.5) * 20), 10, 100);
          const audienceScore = clamp(Math.round(quality * 0.8 + Math.random() * 25), 15, 100);
          comp.filmsReleased += 1;
          comp.totalGross += gross;
          comp.releasesThisQ += 1;
          comp.reputation = clamp(comp.reputation + (quality > 70 ? 2 : -1), 10, 95);
          comp.cash += Math.round(gross * 0.45 - budget);
          if (quality >= 85) comp.awards = (comp.awards || 0) + 1;
          rivalFilmsThisQ.push({
            studio: comp.name, title, genre, quality, budget, totalGross: gross, gross,
            criticScore, audienceScore,
            director: { name: directorName, skill: directorSkill },
            actor: { name: actorName, skill: actorSkill },
            writer: { name: writerName, skill: writerSkill },
            releasedYear: state.year, releasedMonth: state.month,
            personality: comp.personality?.name,
            isRival: true,
          });
        }
        // Rival reputation natural drift
        comp.reputation = clamp(comp.reputation + randInt(-2, 2), 10, 95);
      });

      // Add rival releases to turn summary
      if (rivalFilmsThisQ.length > 0) {
        rivalFilmsThisQ.forEach(rf => {
          turnSummaryData.rivals.push({ text: `${rf.studio} released "${rf.title}" (${rf.genre}) — Gross: ${fmt(rf.totalGross)}` });
        });
      }

      // ENHANCED: Rival alliance formation (quarterly check)
      let rivalAlliances = (state.rivalAlliances || []).map(a => ({ ...a, monthsLeft: a.monthsLeft - 1 })).filter(a => a.monthsLeft > 0);
      if (state.month % 3 === 0 && competitors.length >= 3) {
        const playerIsLeader = competitors.every(c => rep > c.reputation);
        if (playerIsLeader && Math.random() < 0.15 * difficultyScale) {
          const allies = competitors.filter(c => c.cash > 50e6).slice(0, 2).map(c => c.name);
          if (allies.length >= 2) {
            rivalAlliances.push({ studios: allies, purpose: 'counter_leader', monthsLeft: randInt(12, 24) });
            log.push({ text: `INDUSTRY ALERT: ${allies.join(' & ')} formed an alliance to challenge your dominance!`, type: 'warning' });
            allies.forEach(name => {
              const ally = competitors.find(c => c.name === name);
              if (ally) { ally.reputation = clamp(ally.reputation + 3, 10, 95); ally.cash += 20e6; }
            });
          }
        }
      }

      // ENHANCED: Rival acquisitions (annual check in January)
      let rivalAcquisitions = { ...(state.rivalAcquisitions || {}) };
      if (state.month === 1) {
        const hasAntitrust = (state.activeRegulations || []).some(r => r.id === 'antitrust_action');
        competitors.forEach(comp => {
          const acqRate = comp.personality ? (comp.personality.acquisitionRate || 0.03) : 0.03;
          if (comp.cash > 200e6 && Math.random() < acqRate * difficultyScale) {
            // Block acquisitions if antitrust is active
            if (hasAntitrust) {
              rep += 5; // Player gets reputation boost from antitrust enforcement
              log.push({ text: `ANTITRUST: Blocked ${comp.name}'s acquisition attempt. Market competition protected.`, type: 'info' });
              return; // Skip this acquisition
            }
            const acqTypes = ['talent_agency', 'vfx_house', 'theater_chain', 'streaming_tech', 'indie_studio'];
            const acqType = pick(acqTypes);
            const cost = randInt(30, 150) * 1e6;
            comp.cash -= cost;
            const existing = rivalAcquisitions[comp.name] || [];
            existing.push({ type: acqType, year: state.year });
            rivalAcquisitions[comp.name] = existing;
            if (acqType === 'talent_agency') comp.reputation = clamp(comp.reputation + 5, 10, 95);
            if (acqType === 'vfx_house') comp.personality = { ...comp.personality, qualityBonus: (comp.personality?.qualityBonus || 0) + 5 };
            if (acqType === 'streaming_tech') comp.cash += 10e6;
            log.push({ text: `${comp.name} acquired a ${acqType.replace(/_/g, ' ')} for ${fmt(cost)}.`, type: 'info', category: 'rivals' });
          }
        });
      }

      // ENHANCED: AI learning - track genre performance and pivot
      let rivalStrategies = { ...(state.rivalStrategies || {}) };
      if (state.month === 12) {
        competitors.forEach(comp => {
          const compFilms = (state.allFilmHistory || []).filter(f => f.studio === comp.name && f.releasedYear === state.year);
          if (compFilms.length > 0) {
            const avgQuality = compFilms.reduce((s, f) => s + (f.quality || 50), 0) / compFilms.length;
            const profitable = compFilms.filter(f => (f.totalGross || 0) * 0.45 > (f.budget || 0)).length;
            const failedGenres = {};
            compFilms.filter(f => (f.totalGross || 0) * 0.45 < (f.budget || 0)).forEach(f => {
              failedGenres[f.genre] = (failedGenres[f.genre] || 0) + 1;
            });
            if (comp.personality && comp.personality.genreWeights) {
              Object.entries(failedGenres).forEach(([g, count]) => {
                if (count >= 2) {
                  comp.personality.genreWeights[g] = Math.max(0.1, (comp.personality.genreWeights[g] || 1) * 0.5);
                  log.push({ text: `${comp.name} is pulling back from ${g} after poor results.`, type: 'info' });
                }
              });
              const successGenres = {};
              compFilms.filter(f => (f.quality || 0) >= 70).forEach(f => {
                successGenres[f.genre] = (successGenres[f.genre] || 0) + 1;
              });
              Object.entries(successGenres).forEach(([g, count]) => {
                if (count >= 1) {
                  comp.personality.genreWeights[g] = Math.min(4, (comp.personality.genreWeights[g] || 1) * 1.3);
                }
              });
            }
            rivalStrategies[comp.name] = { ...rivalStrategies[comp.name], lastPivotYear: state.year, avgQuality: Math.round(avgQuality), profitRate: compFilms.length > 0 ? profitable / compFilms.length : 0 };
          }
        });
      }

      // ENHANCED: Espionage against player (passive events)
      let activeEspionage = (state.activeEspionage || []).map(e => ({ ...e, monthsLeft: (e.monthsLeft || 1) - 1 })).filter(e => e.monthsLeft > 0);
      let espionageLog = [...(state.espionageLog || [])];
      const securityLevel = state.studioSecurity || 0;

      if (Math.random() < 0.04 * difficultyScale && competitors.length > 0) {
        const aggressor = pick(competitors.filter(c => c.reputation > 30));
        if (aggressor) {
          const action = pick(ESPIONAGE_ACTIONS);
          const blocked = Math.random() < (securityLevel * 0.005);
          if (blocked) {
            log.push({ text: `SECURITY: Blocked ${action.name} attempt by ${aggressor.name}!`, type: 'success', category: 'intelligence' });
            espionageLog.push({ turn: state.turn, type: action.id, rival: aggressor.name, result: 'blocked', desc: `Security blocked: ${action.desc}` });
          } else {
            let effectDesc = action.desc;
            if (action.id === 'twin_film') {
              const playerInDev = films.filter(f => ['development', 'production'].includes(f.status));
              if (playerInDev.length > 0) {
                const target = pick(playerInDev);
                const twinTitle = `${pick(RIVAL_FILM_TITLES)}`;
                log.push({ text: `ESPIONAGE: ${aggressor.name} is rushing "${twinTitle}" — suspiciously similar to your "${target.title}"!`, type: 'warning', category: 'intelligence' });
                target._twinFilmPenalty = (target._twinFilmPenalty || 0) + action.playerGrossPenalty;
                effectDesc = `Twin of "${target.title}" being fast-tracked`;
              }
            } else if (action.id === 'talent_tamper') {
              if (state.contracts.length > 0) {
                const target = pick(state.contracts);
                target.morale = clamp((target.morale || 70) - 15, 20, 100);
                talentRelationships[target.id] = clamp((talentRelationships[target.id] || 50) - action.relationshipPenalty, 0, 100);
                log.push({ text: `ESPIONAGE: ${aggressor.name} is trying to lure away ${target.name}! Morale and loyalty dropping.`, type: 'warning', category: 'intelligence' });
                effectDesc = `${target.name} being courted by ${aggressor.name}`;
              }
            } else if (action.id === 'leaked_script') {
              const inProd = films.filter(f => f.status === 'production' || f.productionPhase === 'principal_photography');
              if (inProd.length > 0) {
                const target = pick(inProd);
                target._leakedScript = true;
                log.push({ text: `ESPIONAGE: Script for "${target.title}" was leaked online! Opening weekend will suffer.`, type: 'warning', category: 'intelligence' });
                effectDesc = `Script leaked for "${target.title}"`;
              }
            } else if (action.id === 'negative_reviews') {
              const released = films.filter(f => f.status === 'released' && f.releasedYear === state.year);
              if (released.length > 0) {
                const target = pick(released);
                target.criticScore = clamp((target.criticScore || 50) - action.criticScorePenalty, 5, 100);
                log.push({ text: `ESPIONAGE: Suspicious wave of negative reviews for "${target.title}"!`, type: 'warning' });
                effectDesc = `Planted reviews hurt "${target.title}"`;
              }
            } else if (action.id === 'poach_crew') {
              const inProd = films.filter(f => f.status === 'production' || f.productionPhase === 'principal_photography');
              if (inProd.length > 0) {
                const target = pick(inProd);
                target._qualityBoost = (target._qualityBoost || 0) - action.qualityPenalty;
                target.turnsNeeded += action.delayMonths;
                target.events.push(`Key crew poached by ${aggressor.name} — delays and quality hit`);
                log.push({ text: `ESPIONAGE: ${aggressor.name} poached key crew from "${target.title}"!`, type: 'warning' });
                effectDesc = `Crew poached from "${target.title}"`;
              }
            } else if (action.id === 'smear_campaign') {
              rep -= action.repPenalty;
              log.push({ text: `ESPIONAGE: ${aggressor.name} launched a smear campaign against your studio!`, type: 'warning' });
              effectDesc = `Smear campaign, -${action.repPenalty} reputation`;
            }
            espionageLog.push({ turn: state.turn, type: action.id, rival: aggressor.name, result: 'success', desc: effectDesc });
          }
        }
      }

      // ENHANCED: Streaming price wars
      if (streaming && rivalStreamers.length > 0) {
        rivalStreamers.forEach(rs => {
          if (rs.subscribers < streaming.subscribers && Math.random() < 0.05 * difficultyScale) {
            const stolenSubs = Math.round(streaming.subscribers * 0.02);
            streaming.subscribers = Math.max(0, streaming.subscribers - stolenSubs);
            rs.subscribers += stolenSubs;
            log.push({ text: `PRICE WAR: ${rs.name} dropped prices! Lost ${Math.round(stolenSubs / 1000)}K subscribers.`, type: 'warning' });
          }
        });
      }

      // ENHANCED: Genre flooding by dominant studios
      if (state.month % 6 === 0 && competitors.length > 0) {
        const playerDominantGenres = Object.entries(playerGenreShare).filter(([g, s]) => s > 0.3).map(([g]) => g);
        if (playerDominantGenres.length > 0 && Math.random() < 0.1 * difficultyScale) {
          const floodGenre = pick(playerDominantGenres);
          const floodStudio = pick(competitors.filter(c => c.cash > 100e6));
          if (floodStudio) {
            for (let i = 0; i < randInt(2, 3); i++) {
              const budget = randInt(5, 20) * 1e6;
              const quality = randInt(25, 50);
              const gross = Math.round(budget * 0.8);
              const title = pick(RIVAL_FILM_TITLES) + ': ' + pick(['Unleashed', 'Rising', 'Returns', 'Redux']);
              rivalFilmsThisQ.push({
                studio: floodStudio.name, title, genre: floodGenre, quality, budget, totalGross: gross, gross,
                criticScore: clamp(quality + randInt(-10, 5), 10, 60), audienceScore: clamp(quality + randInt(-5, 10), 15, 60),
                director: { name: pick(RIVAL_DIRECTOR_NAMES), skill: quality }, actor: { name: pick(RIVAL_ACTOR_NAMES), skill: quality },
                writer: { name: pick(RIVAL_WRITER_NAMES), skill: quality },
                releasedYear: state.year, releasedMonth: state.month, isRival: true, isFlood: true,
              });
            }
            log.push({ text: `MARKET FLOOD: ${floodStudio.name} is dumping cheap ${floodGenre} films to devalue the genre!`, type: 'warning' });
          }
        }
      }

      // REBALANCED: Hostile takeover system with gating, warnings, cooldowns, and difficulty scaling
      let hostileTakeoverOffer = state.hostileTakeoverOffer;
      const gameAge = state.year - (state.startYear || 1970);
      const takeoverMinYears = 15; // No takeovers before 15 years in

      if (!hostileTakeoverOffer && gameAge >= takeoverMinYears && takeoverCooldown <= 0) {
        // Calculate weakness signals — multiple must be present simultaneously
        const hasNegativeCash = cash < 0;
        const hasLowRep = rep < 25;
        const hasHeavyDebt = (state.loans || []).length >= 3;
        const stockDroppedHard = stockPricePeak > 0 && stockPrice > 0 && stockPrice < stockPricePeak * 0.6; // 40%+ drop from peak
        const hasConsecutiveFlops = consecutiveFlops >= 3;
        const hasCriticallyLowCash = cash < -(state.loans || []).reduce((s, l) => s + (l.amount || 0), 0) * 0.5;

        // Count weakness signals
        const weaknessSignals = (hasNegativeCash ? 1 : 0) + (hasLowRep ? 1 : 0) + (hasHeavyDebt ? 1 : 0)
          + (stockDroppedHard ? 1 : 0) + (hasConsecutiveFlops ? 1 : 0) + (hasCriticallyLowCash ? 1 : 0);

        // Need at least 2 weakness signals to even consider a takeover
        if (weaknessSignals >= 2) {
          // Difficulty scaling: lower difficulty = much rarer takeovers
          const diffMult = difficultyScale < 1.0 ? 0.3 : difficultyScale < 1.2 ? 0.6 : difficultyScale < 1.5 ? 1.0 : 1.5;

          // Warning escalation system: rumors → activist investors → full bid
          if (takeoverWarningLevel === 0) {
            // 8% base chance to start rumors (scaled by difficulty)
            const rumorChance = 0.08 * diffMult;
            if (Math.random() < rumorChance) {
              takeoverWarningLevel = 1;
              log.push({ text: 'RUMOR: Industry insiders are speculating about potential acquisition interest in your studio.', type: 'info' });
            }
          } else if (takeoverWarningLevel === 1) {
            // 10% chance to escalate to activist investors
            const activistChance = 0.10 * diffMult;
            if (weaknessSignals >= 2 && Math.random() < activistChance) {
              takeoverWarningLevel = 2;
              log.push({ text: 'WARNING: Activist investors are circling your studio, pushing for a change in leadership or a sale.', type: 'warning' });
            } else if (weaknessSignals < 2) {
              // Studio recovered — drop back to no warnings
              takeoverWarningLevel = 0;
              log.push({ text: 'Acquisition rumors have subsided as your studio shows signs of recovery.', type: 'success' });
            }
          } else if (takeoverWarningLevel === 2) {
            // 7% chance to escalate to actual takeover bid — requires 3+ weakness signals now
            const bidChance = 0.07 * diffMult;
            if (weaknessSignals >= 3 && Math.random() < bidChance) {
              const buyer = competitors.filter(c => c.cash > 200e6).sort((a, b) => b.cash - a.cash)[0];
              if (buyer) {
                const studioValue = Math.max(50e6, tGross * 0.1 + (streaming?.subscribers || 0) * 5 + films.length * 2e6);
                const offer = Math.round(studioValue * (0.8 + Math.random() * 0.4));
                const defenseCost = Math.round(offer * 0.3);
                hostileTakeoverOffer = { buyer: buyer.name, offer, defenseCost, deadline: 3 };
                takeoverWarningLevel = 3;
                log.push({ text: `HOSTILE TAKEOVER: ${buyer.name} launches a ${fmt(offer)} bid for ${state.studioName}! You need ${fmt(defenseCost)} to defend. You have 3 months.`, type: 'warning' });
                // NEWSPAPER: Hostile takeover bid
                newspaperEdition++;
                const tn = makeNewspaper('hostile_takeover', { studio: state.studioName, buyer: buyer.name, offer: fmt(offer) }, state.year, state.month, newspaperEdition);
                if (tn) newspaperQueue.push(tn);
              }
            } else if (weaknessSignals < 2) {
              // Studio recovered — drop back
              takeoverWarningLevel = 0;
              log.push({ text: 'Activist investors have backed off as your studio\'s position improved.', type: 'success' });
            }
          }
        } else if (takeoverWarningLevel > 0 && takeoverWarningLevel < 3) {
          // Studio is doing fine now — clear warnings
          takeoverWarningLevel = 0;
        }
      }

      // Handle active takeover deadline countdown
      if (hostileTakeoverOffer && hostileTakeoverOffer.deadline) {
        hostileTakeoverOffer = { ...hostileTakeoverOffer, deadline: hostileTakeoverOffer.deadline - 1 };
        if (hostileTakeoverOffer.deadline <= 0) {
          log.push({ text: `TAKEOVER COMPLETE: ${hostileTakeoverOffer.buyer} acquired your studio. Game over.`, type: 'warning' });
          phase = 'legacy';
        }
      }

      // Accumulate rival films for annual awards
      let rivalFilmsThisYear = [...(state.rivalFilmsThisYear || []), ...rivalFilmsThisQ];
      // Reset at start of new year (month 12 means next turn is Jan)
      if (state.month === 12) rivalFilmsThisYear = [];

      // Market saturation: if rivals release many films, your films get a slight penalty
      const totalRivalReleases = competitors.reduce((s, c) => s + c.releasesThisQ, 0);
      if (totalRivalReleases >= 3) {
        log.push({ text: `Crowded month! ${totalRivalReleases} rival films compete for audience.`, type: 'info' });
      }

      // 11b. Stock price update (if public) - ENHANCED
      let isPublic = state.isPublic;
      // stockPrice already declared at top of END_TURN
      let stockHistory = [...state.stockHistory];
      let shareholderDemand = state.shareholderDemand;
      if (isPublic) {
        const quarterlyRevenue = revenue;
        const quarterlyExpenses = expenses;
        const earningsRatio = quarterlyRevenue / Math.max(quarterlyExpenses, 1);

        let sentimentMod = 0;
        if (films.some(f => f.status === 'released' && f.releasedYear === state.year && f.releasedMonth === state.month && f.quality >= 85)) sentimentMod += 8;
        if (films.some(f => f.status === 'released' && f.releasedYear === state.year && f.releasedMonth === state.month && f.profit < 0)) sentimentMod -= 5;
        if (streaming && streaming.subscribers > (state.streamingPlatform?.subscribers || 0)) sentimentMod += 3;
        (state.activeZeitgeist || []).forEach(z => { if (z.grossMult < 1) sentimentMod -= 2; else sentimentMod += 1; });

        const priceChange = (earningsRatio - 1) * 15 + sentimentMod + (Math.random() - 0.5) * 8;
        stockPrice = Math.max(1, Math.round(stockPrice + priceChange));
        stockHistory.push({ turn: state.turn + 1, price: stockPrice });

        shareholderDemand = clamp(shareholderDemand + (revenue < expenses ? 12 : -5), 0, 100);
        if (shareholderDemand >= 80) {
          log.push({ text: 'Shareholders are FURIOUS! Stock price plummeting.', type: 'warning' });
          stockPrice = Math.max(1, Math.round(stockPrice * 0.82));
        }
        if (state.month % 3 === 0) {
          shareholderDemand += 5;
          if (shareholderDemand > 50) log.push({ text: 'Quarterly pressure: Shareholders expect returns.', type: 'info' });
        }
        // Track peak stock price for takeover vulnerability
        if (stockPrice > stockPricePeak) stockPricePeak = stockPrice;
      }

      // 12. Advance time (moved up so newMonth/newYear are available for systems below)
      let newMonth = state.month + 1;
      let newYear = state.year;
      if (newMonth > 12) { newMonth = 1; newYear += 1; }

      // SYSTEM 1: Filmmaking Era transition
      const newEra = getCurrentFilmEra(newYear);
      let currentFilmEra = newEra.id;
      if (newEra.id !== state.currentFilmEra) {
        log.push({ text: `ERA SHIFT: ${newEra.announcement}`, type: 'info' });
        // NEWSPAPER: Era transition
        newspaperEdition++;
        const eraN = makeNewspaper('era_transition', { eraName: newEra.name, techDesc: newEra.techDesc, announcement: newEra.announcement, studio: state.studioName }, newYear, 1, newspaperEdition);
        if (eraN) newspaperQueue.push(eraN);
      }

      // SYSTEM 3: Economic Cycle progression
      let economicCycle = { ...state.economicCycle };
      economicCycle.monthsLeft = Math.max(0, economicCycle.monthsLeft - 1);
      if (economicCycle.monthsLeft <= 0) {
        const phases = ['boom', 'stable', 'recession', 'stable', 'boom', 'stable', 'recession', 'depression', 'stable'];
        const currentIdx = phases.indexOf(economicCycle.phase);
        const nextPhase = phases[(currentIdx + 1) % phases.length];
        const cycleDef = ECONOMIC_CYCLES.find(c => c.id === nextPhase);
        if (cycleDef) {
          economicCycle = { phase: nextPhase, monthsLeft: randInt(cycleDef.duration[0], cycleDef.duration[1]) };
          log.push({ text: `ECONOMY: ${cycleDef.name} begins. ${cycleDef.desc}`, type: nextPhase === 'recession' || nextPhase === 'depression' ? 'warning' : 'info' });
          // NEWSPAPER: Major economic shifts
          if (nextPhase === 'recession' || nextPhase === 'depression') {
            newspaperEdition++;
            const econN = makeNewspaper('economic_recession', { studio: state.studioName }, newYear, newMonth, newspaperEdition);
            if (econN) newspaperQueue.push(econN);
          } else if (nextPhase === 'boom') {
            newspaperEdition++;
            const econN = makeNewspaper('economic_boom', { studio: state.studioName }, newYear, newMonth, newspaperEdition);
            if (econN) newspaperQueue.push(econN);
          }
        } else {
          economicCycle = { phase: 'stable', monthsLeft: 48 };
        }
      }

      // SYSTEM 3: Spawn AI studios
      let aiStudiosSpawned = [...(state.aiStudiosSpawned || [])];
      AI_STUDIOS.forEach(aiStudio => {
        if (newYear >= aiStudio.founded && !aiStudiosSpawned.includes(aiStudio.name)) {
          const newAI = {
            name: aiStudio.name,
            founded: aiStudio.founded,
            isAI: true,
            personality: { name: aiStudio.strategy, qualityBonus: 5, budgetMult: 0.8, marketingMult: 0.9, aggression: 0.15, genreWeights: {} },
            reputation: 50,
            prestige: 30,
            cash: 100e6,
            totalGross: 0,
            filmsReleased: 0,
            awards: 0,
          };
          competitors.push(newAI);
          aiStudiosSpawned.push(aiStudio.name);
          log.push({ text: `NEW AI STUDIO: ${aiStudio.name} emerges! "${aiStudio.desc}"`, type: 'info' });
        }
      });

      // SYSTEM 3: World Events triggering
      let worldEventsTriggered = [...(state.worldEventsTriggered || [])];
      let activeZeitgeist = [...(state.activeZeitgeist || [])];
      WORLD_EVENTS.forEach(event => {
        if (newYear >= event.triggerYear && !worldEventsTriggered.includes(event.id)) {
          let eventToadd = {
            id: event.id,
            name: event.name,
            monthsLeft: event.duration,
            grossMult: event.grossMult || 1.0,
            streamingBoost: event.streamingBoost || 0,
            qualityMod: event.qualityMod || 0,
            budgetMult: event.budgetMult || 1.0,
            talentCostMult: event.talentCostMult || 1.0,
            genreBoost: event.genreBoost || {},
            productionDelay: event.productionDelay || 0,
          };
          activeZeitgeist = [...activeZeitgeist, eventToadd];
          worldEventsTriggered.push(event.id);
          log.push({ text: `WORLD EVENT: ${event.name}! ${event.desc}`, type: 'warning' });
        }
      });

      // SYSTEM 4: Labor strikes check
      const laborRel = LABOR_RELATIONS[state.laborRelations];
      let strikeChance = laborRel?.strikeChance || 0;
      // Apply coalition labor bonus (reduces strike chance)
      const talentCoal = state.playerCoalition ? INDUSTRY_COALITIONS.find(c => c.id === state.playerCoalition) : null;
      if (talentCoal?.effect?.laborBonus) {
        strikeChance *= 0.5; // 50% reduction in strike chance
      }
      if (laborRel && Math.random() < strikeChance) {
        films.filter(f => ['development', 'production'].includes(f.status)).forEach(f => {
          f.turnsNeeded = Math.min(f.turnsNeeded + 2, f.turnsNeeded * 1.3);
          f.events.push('LABOR STRIKE: Production delayed 2 months');
        });
        log.push({ text: `UNION STRIKE! All productions delayed. Labor relations now at risk.`, type: 'warning' });
        // NEWSPAPER: Industry strike
        newspaperEdition++;
        const strikeN = makeNewspaper('strike', { studio: state.studioName }, state.year, state.month, newspaperEdition);
        if (strikeN) newspaperQueue.push(strikeN);
        rep -= 5;
      }

      // SYSTEM 4: Talent relationships update (talentRelationships declared at top of END_TURN)
      films.filter(f => f.status === 'released' && f.releasedYear === state.year && f.releasedMonth === state.month).forEach(film => {
        [film.director, film.actor, film.writer].forEach(t => {
          if (t && t.id) {
            const current = talentRelationships[t.id] || 50;
            let delta = 0;
            if (film.quality >= 85) delta += 8;
            else if (film.quality >= 70) delta += 4;
            else if (film.quality < 40) delta -= 10;
            else delta += 1;
            if (film.profit > 0) delta += 3;
            if (film.profit < -10e6) delta -= 5;
            talentRelationships[t.id] = clamp(current + delta, 0, 100);
          }
        });
      });
      Object.keys(talentRelationships).forEach(tid => {
        const val = talentRelationships[tid];
        if (val > 55) talentRelationships[tid] = val - 1;
        else if (val < 45) talentRelationships[tid] = val + 1;
      });

      // Walk of Fame: Check if any contracted talent has reached Legendary
      let walkOfFame = [...(state.walkOfFame || [])];
      const inductedNames = new Set(walkOfFame.map(w => w.name));
      (state.contracts || []).forEach(t => {
        const stage = getCareerStage(t);
        if (stage && stage.id === 'legendary' && !inductedNames.has(t.name)) {
          walkOfFame.push({ name: t.name, type: t.type, yearInducted: state.year, achievement: `${t.filmography || 0} films, skill ${t.skill}` });
          log.push({ text: `⭐ ${t.name} receives a star on the Hollywood Walk of Fame!`, type: 'award' });
          pres += 3;
          newspaperEdition++;
          const wofN = makeNewspaper('award_sweep', { studio: state.studioName, film: t.name + '\'s Career', count: 'Walk of Fame', show: 'Hollywood Walk of Fame' }, state.year, state.month, newspaperEdition);
          if (wofN) newspaperQueue.push(wofN);
        }
      });

      // 11c. Hostile takeover (rebalanced — see REBALANCED section above with warning system, gating, cooldowns)

      // 11d. Update rival competition with personality-driven behavior
      competitors.forEach(comp => {
        if (comp.personality) {
          const p = comp.personality;
          // Personality-driven cash growth
          comp.cash += Math.round(comp.cash * 0.02 * (1 + p.budgetMult * 0.1));
          // Personality-driven reputation shifts
          if (p.name === 'Award Chaser') comp.prestige = clamp((comp.prestige || 0) + 1, 0, 95);
          if (p.name === 'Blockbuster King') comp.cash += Math.round(comp.totalGross * 0.001);
          if (p.name === 'Disruptor' && Math.random() < 0.1) comp.reputation = clamp(comp.reputation + randInt(-5, 10), 10, 95);
        }
      });

      // 11e. Update active movements & chemistry
      const activeMovements = getActiveMovements(state.year);

      // 11f. Industry crises check
      let activeCrises = (state.activeCrises || []).map(c => ({ ...c, monthsLeft: c.monthsLeft - 1 }));
      activeCrises = activeCrises.filter(c => c.monthsLeft > 0);
      // Check for new crises
      INDUSTRY_CRISES.forEach(crisis => {
        if (crisis.years.includes(state.year) && state.month === 1 && !activeCrises.find(c => c.id === crisis.id)) {
          activeCrises.push({ id: crisis.id, name: crisis.name, monthsLeft: crisis.duration, effects: crisis.effects });
          log.push({ text: `INDUSTRY CRISIS: ${crisis.name}! ${crisis.effects.desc}`, type: 'warning' });
        }
      });
      // Apply crisis effects to this turn's revenue
      activeCrises.forEach(crisis => {
        if (crisis.effects.boxOfficeMod) {
          // Already-released films this month get reduced box office (handled in release section)
        }
        if (crisis.effects.streamingBoost && streaming) {
          revenue += Math.round((streaming.subscribers || 0) * crisis.effects.streamingBoost * 0.5);
        }
      });

      // Deactivate used co-productions
      let coProductions = state.coProductions.map(cp => ({ ...cp, active: false }));

      // 12a. Spawn new studios that should exist by this year
      const newStudios = RIVAL_STUDIOS.filter(s => {
        // Studio was founded this year
        if (s.founded !== newYear) return false;
        // Not already in competitors or acquired
        if (competitors.some(c => c.name === s.name)) return false;
        if ((state.acquiredStudios || []).includes(s.name)) return false;
        return true;
      });
      newStudios.forEach(s => {
        const newComp = makeCompetitor(s);
        competitors.push(newComp);
        log.push({ text: `NEW STUDIO: ${s.name} enters the industry! "${s.desc}"`, type: 'info' });
      });

      // Remove defunct studios
      const defunctThisYear = competitors.filter(c => c.defunct && c.defunct === newYear);
      defunctThisYear.forEach(c => {
        log.push({ text: `${c.name} has shut down operations.`, type: 'warning' });
      });
      competitors = competitors.filter(c => !c.defunct || c.defunct > newYear);

      // 12b. Monthly tax withholding
      {
        const monthlyProfit = Math.max(revenue - expenses, 0);
        let deductions = 0;
        state.taxDeductions.forEach(did => {
          const d = TAX_DEDUCTIONS.find(td => td.id === did);
          if (d) deductions += d.rate;
        });
        const taxableIncome = Math.round(monthlyProfit * (1 - Math.min(deductions, 0.25)));
        const taxBill = Math.round(taxableIncome * TAX_RATE);
        if (taxBill > 0) {
          cash -= taxBill;
          expenses += taxBill;
          log.push({ text: `Monthly tax: ${fmt(taxBill)}${deductions > 0 ? ` (deductions saved ${fmt(Math.round(monthlyProfit * Math.min(deductions, 0.25) * TAX_RATE))})` : ''}.`, type: 'info' });
        }
        // Charitable deduction cost (monthly portion)
        if (state.taxDeductions.includes('charitable')) {
          const donation = Math.round(monthlyProfit * 0.03);
          if (donation > 0) {
            cash -= donation;
            log.push({ text: `Charitable donation: ${fmt(donation)}.`, type: 'info' });
          }
        }
        // Accounting risk (annual check in December)
        if (newMonth === 1 && state.month === 12 && state.taxDeductions.includes('accounting') && Math.random() < 0.15) {
          const penalty = Math.round(taxBill * 6);
          cash -= penalty;
          rep -= 5;
          log.push({ text: `TAX AUDIT! Creative accounting caught. Penalty: ${fmt(penalty)}, -5 reputation.`, type: 'warning' });
        }
        // Annual charitable reputation bonus (December)
        if (newMonth === 1 && state.month === 12 && state.taxDeductions.includes('charitable')) {
          rep += 2;
          log.push({ text: `Annual charitable giving recognized. +2 reputation.`, type: 'info' });
        }
      }

      // 13. Check era change → regenerate trends
      let trends = state.genreTrends;
      if (getEra(newYear) !== getEra(state.year)) {
        trends = makeGenreTrends(newYear);
        log.push({ text: `A new era begins: ${getEra(newYear)}!`, type: 'info' });
      }

      // 14. Bankruptcy check
      let bankruptLog = [];
      if (cash < BANKRUPTCY_THRESHOLD && loans.length > 0) {
        bankruptLog.push({ text: 'BANKRUPTCY WARNING: Your studio is in severe debt!', type: 'warning' });
        // Fire most expensive talent
        const sortedContracts = [...contracts].sort((a, b) => b.salary - a.salary);
        if (sortedContracts.length > 3) {
          const fired = sortedContracts.slice(0, sortedContracts.length - 3);
          fired.forEach(t => bankruptLog.push({ text: `${t.name} was let go due to financial restructuring.`, type: 'warning' }));
          contracts = sortedContracts.slice(sortedContracts.length - 3);
        }
        // Sell theme parks
        if (themeParks.length > 0) {
          const parkValue = themeParks.reduce((sum, p) => sum + (p.operational ? 20000000 : 5000000), 0);
          cash += parkValue;
          bankruptLog.push({ text: `Theme parks sold for ${fmt(parkValue)} in emergency restructuring.`, type: 'warning' });
          themeParks = [];
        }
        // Sell theater chains
        if (theaterChains.length > 0) {
          const chainValue = theaterChains.reduce((sum, c) => sum + Math.round(c.cost * 0.4), 0);
          cash += chainValue;
          bankruptLog.push({ text: `Theater chains sold for ${fmt(chainValue)}.`, type: 'warning' });
          theaterChains = [];
        }
        // Reduce all loan principals by 50% (debt restructuring)
        loans = loans.map(l => ({ ...l, amount: Math.round(l.amount * 0.5) }));
        bankruptLog.push({ text: 'Debt restructured — loan balances reduced 50%. Reputation severely damaged.', type: 'warning' });
        rep -= 15;
        pres -= 10;
      }
      log.push(...bankruptLog);

      // 14b. Scenario goal check
      let scenarioWon = state.scenarioWon;
      if (!scenarioWon && state.scenarioGoal && state.scenarioDeadline) {
        let goalMet = false;
        const goal = state.scenarioGoal;
        if (goal.type === 'cash' && cash >= goal.target) {
          goalMet = true;
          log.push({ text: `VICTORY! You've reached $${(goal.target / 1e6).toFixed(0)}M cash! Scenario complete.`, type: 'award' });
        } else if (goal.type === 'awards' && tAwards >= goal.target) {
          goalMet = true;
          log.push({ text: `VICTORY! You've won ${goal.target} awards! Scenario complete.`, type: 'award' });
        } else if (goal.type === 'franchises' && franchises.length >= goal.target) {
          goalMet = true;
          log.push({ text: `VICTORY! You've built ${goal.target} franchises! Scenario complete.`, type: 'award' });
        } else if (goal.type === 'genreMaster') {
          const profitableGenres = new Set(films.filter(f => f.status === 'released' && f.profit > 0).map(f => f.genre));
          if (GENRES.every(g => profitableGenres.has(g))) {
            goalMet = true;
            log.push({ text: `VICTORY! You've released a profitable film in every genre! Scenario complete.`, type: 'award' });
          }
        }
        if (goalMet) scenarioWon = true;
        else if (newYear > state.scenarioDeadline) {
          log.push({ text: `Scenario deadline passed (${state.scenarioDeadline}). ${goal.type === 'cash' ? 'Target: $' + (goal.target / 1e6).toFixed(0) + 'M' : goal.type === 'awards' ? 'Target: ' + goal.target + ' awards' : 'Target goal not met'}.`, type: 'warning' });
        }
      }

      // 15. Refresh talent pool and scripts
      const newNextId = state.nextId + 20;
      const newAvail = Array.from({ length: 10 }, (_, i) => {
        const types = ['actor', 'director', 'writer', 'producer'];
        return makeTalent(state.nextId + i, pick(types), [25, 90]);
      });

      // Process pending screenplays
      let updatedPendingScreenplays = (state.pendingScreenplays || []).map(s => ({ ...s, turnsLeft: s.turnsLeft - 1 }));
      const deliveredScreenplays = updatedPendingScreenplays.filter(s => s.turnsLeft <= 0).map((s, i) => {
        const writerObj = { skill: s.writerSkill, genreBonus: s.writerGenreBonus };
        const quality = calcScreenplayQuality(writerObj, s.genre, s.devBudget || 1e6, 2);
        return {
          id: 200 + i, genre: s.genre, genre2: s.genre2, title: s.title, logline: s.logline,
          budgetMin: s.budgetMin, budgetMax: s.budgetMax,
          marketFit: quality,
          isOriginal: true, writerName: s.writerName,
        };
      });
      updatedPendingScreenplays = updatedPendingScreenplays.filter(s => s.turnsLeft > 0);
      if (deliveredScreenplays.length > 0) {
        log.push({ text: `Screenplay${deliveredScreenplays.length > 1 ? 's' : ''} completed: ${deliveredScreenplays.map(s => `"${s.title}" (quality: ${s.marketFit})`).join(', ')}.`, type: 'success' });
      }

      // Refresh IP marketplace every turn (new IPs become available)
      const refreshedIPMarketplace = generateIPMarketplace(newYear, state.ownedIPs, 6);

      // Scripts are now: any existing unselected scripts + newly delivered screenplays
      // Remove old scripts that weren't from IPs or originals, keep IP scripts and player originals
      const keptScripts = state.scripts.filter(s => s.isIP || s.isOriginal);
      const newScripts = [...keptScripts, ...deliveredScreenplays];

      // Accumulate released films into permanent history
      const newPlayerReleases = films.filter(f => f.status === 'released' && f.releasedYear === state.year && f.releasedMonth === state.month)
        .map(f => ({ ...f, studio: state.studioName, isRival: false, historyId: f.id }));
      const newRivalReleases = rivalFilmsThisQ.map((rf, i) => ({ ...rf, historyId: `rival_${state.turn}_${i}` }));
      const allFilmHistory = [...(state.allFilmHistory || []), ...newPlayerReleases, ...newRivalReleases];

      // ==================== BATCH 4: FEATURE END_TURN LOGIC ====================

      // Feature 12: Press Events - randomly generate based on released films and talent
      let pressEvents = [...(state.pressEvents || [])];
      if (state.films.filter(f => f.status === 'released').length > 0 || Math.random() < 0.15) {
        if (Math.random() < 0.25) {
          const event = pick(PRESS_EVENTS);
          const newEvent = {
            id: state.nextId + 100 + pressEvents.length,
            type: event.id,
            name: event.name,
            desc: event.desc,
            repChange: event.repChange,
            buzzChange: event.buzzChange,
            prestigeChange: event.prestigeChange,
            turnCreated: state.turn,
          };
          pressEvents.push(newEvent);
          log.push({ text: `PRESS: ${event.name} — ${event.desc}`, type: 'info' });
        }
      }

      // Feature 13: Film School Pipeline - check for graduates
      let filmSchools = (state.filmSchools || []).map(fs => {
        const schoolDef = FILM_SCHOOLS.find(s => s.id === fs.schoolId);
        if (!schoolDef) return fs;

        // Deduct monthly upkeep
        cash -= schoolDef.monthlyUpkeep;

        // Check if graduate is ready
        if (state.turn >= fs.nextGraduate && Math.random() < 0.7) {
          // Chance for graduate to appear - mark for creation
          fs._pendingGraduate = true;
          return { ...fs, nextGraduate: state.turn + schoolDef.graduateInterval };
        }
        return fs;
      });

      // Collect graduates to add to talent pool
      let schoolGraduates = [];
      filmSchools.forEach((fs, idx) => {
        if (fs._pendingGraduate) {
          const schoolDef = FILM_SCHOOLS.find(s => s.id === fs.schoolId);
          const talentType = pick(['director', 'actor', 'writer']);
          const qualityRange = schoolDef.talentQualityRange;
          const skill = Math.round(qualityRange[0] + Math.random() * (qualityRange[1] - qualityRange[0]));
          const talentId = state.nextId + 200 + pressEvents.length + idx;
          const graduate = makeTalent(talentId, talentType, [skill, skill], [22, 30]); // young graduates
          // Apply salary discount from school tier
          graduate.salary = Math.round(graduate.salary * schoolDef.salaryMult);
          schoolGraduates.push(graduate);
          log.push({ text: `${schoolDef.name} graduate: ${graduate.name} (${talentType}, skill ${skill})`, type: 'success' });
          delete fs._pendingGraduate;
        }
      });

      // Feature 14: International Partnerships - deduct monthly fees, provide bonuses to relevant films
      let intlPartners = state.internationalPartners || [];
      intlPartners.forEach(ip => {
        const partnerDef = INTERNATIONAL_PARTNERS.find(p => p.id === ip.partnerId);
        if (partnerDef && ip.active) {
          cash -= partnerDef.monthlyFee;
        }
      });

      // ==================== NEW SYSTEMS: END_TURN LOGIC ====================

      // SYSTEM 1: Genre Cycle & Fatigue Updates (annual, month 12)
      let genreCycleState = { ...state.genreCycleState };
      let genreFatigueLog = [...(state.genreFatigueLog || [])];
      if (state.month === 12) {
        GENRES.forEach(genre => {
          const playerFilms = films.filter(f => f.status === 'released' && f.genre === genre && f.releasedYear === state.year).length;
          const rivalFilms = (state.allFilmHistory || []).filter(f => f.genre === genre && f.releaseYear === state.year && f.isRival).length;
          const totalThisYear = playerFilms + rivalFilms;
          const current = genreCycleState[genre] || { phase: 'stable', momentum: 0, filmsThisYear: 0 };
          let momentum = current.momentum;
          if (totalThisYear >= AUDIENCE_FATIGUE_THRESHOLD) {
            momentum -= 25;
            if (totalThisYear >= 6) momentum -= 15;
          } else if (totalThisYear === 0 || totalThisYear === 1) {
            momentum += 15;
          }
          momentum = clamp(momentum, -100, 100);
          const phases = ['fatigued', 'declining', 'stable', 'rising', 'boom'];
          const phaseIdx = Math.max(0, Math.min(4, Math.round((momentum + 100) / 50)));
          const phase = phases[phaseIdx];
          genreCycleState[genre] = { phase, momentum, filmsThisYear: totalThisYear };
          if (totalThisYear >= AUDIENCE_FATIGUE_THRESHOLD) {
            genreFatigueLog.push({ genre, year: state.year, films: totalThisYear, effect: `Fatigue detected (${totalThisYear} films)` });
            log.push({ text: `${genre} fatigue: ${totalThisYear} films released. Audiences tiring of the genre.`, type: 'warning' });
          }
        });
      }

      // SYSTEM 2: Talent Mood & Loyalty (update after each film release)
      let talentMoods = { ...state.talentMoods };
      films.filter(f => f.status === 'released' && f.releasedYear === state.year && f.releasedMonth === state.month).forEach(film => {
        [film.director, film.actor, film.writer].forEach(talent => {
          if (talent && talent.id) {
            talent.consecutiveFilms = (talent.consecutiveFilms || 0) + 1;
            talent.lastFilmQuality = film.quality;
            if (film.quality >= 75) {
              talent.consecutiveHits = (talent.consecutiveHits || 0) + 1;
            } else {
              talent.consecutiveHits = 0;
            }
            talent.marketValue = calcSalaryDemand(talent);
            const mood = calcTalentMood(talent);
            talentMoods[talent.id] = mood;
            if (mood < 20 && Math.random() < 0.10) {
              log.push({ text: `${talent.name} left the studio due to low morale!`, type: 'warning' });
              contracts = contracts.filter(c => c.id !== talent.id);
            }
          }
        });
      });

      // SYSTEM 3: Awards Campaigns - already tracked in awardsCampaignsDetailed, enhance awards calculation during ceremony
      // (awards ceremony logic at month 12 already factored in)

      // SYSTEM 4: Catalog Revenue (monthly from old films)
      let catalogRevenue = 0;
      state.films.filter(f => f.status === 'released').forEach(film => {
        const catValue = calcCatalogValue(film, state.year);
        catalogRevenue += catValue;
      });
      revenue += catalogRevenue;

      // SYSTEM 5: Cinematic Universe Effects (at year end, update brand health)
      let cinematicUniverses = (state.cinematicUniverses || []).map(u => {
        if (state.month === 12) {
          const universeFilms = films.filter(f => {
            const fran = franchises.find(fr => fr.id === f.franchiseId);
            return f.status === 'released' && fran && u.franchiseIds.includes(fran.id);
          });
          let brandHealthDelta = 0;
          universeFilms.forEach(uf => {
            if (uf.quality < 40) brandHealthDelta -= 10;
            else if (uf.quality >= 75) brandHealthDelta += 5;
          });
          const newHealth = clamp(u.brandHealth + brandHealthDelta, 0, 100);
          const newTier = UNIVERSE_TIERS.slice().reverse().find(t => u.franchiseIds.length >= t.minFilms) || UNIVERSE_TIERS[0];
          return { ...u, brandHealth: newHealth, tier: newTier.id };
        }
        return u;
      });

      // SYSTEM 6: Release Strategy affects gross (already applied in release calculation)

      // SYSTEM 7: Studio Facilities - deduct upkeep each month
      (state.studioFacilities || []).forEach(fac => {
        const def = STUDIO_FACILITIES.find(f => f.id === fac.facilityId);
        if (def) {
          cash -= def.monthlyUpkeep;
          expenses += def.monthlyUpkeep;
        }
      });

      // SYSTEM 8: Zeitgeist Events (2% chance each month for new event)
      activeZeitgeist = activeZeitgeist.map(z => ({ ...z, monthsLeft: z.monthsLeft - 1 }));
      activeZeitgeist = activeZeitgeist.filter(z => z.monthsLeft > 0);
      if (activeZeitgeist.length < 2 && Math.random() < 0.02) {
        const event = pick(ZEITGEIST_EVENTS);
        const duration = randInt(event.duration[0], event.duration[1]);
        activeZeitgeist.push({
          id: state.nextId + 300 + activeZeitgeist.length,
          name: event.name,
          monthsLeft: duration,
          grossMult: event.grossMult,
          budgetInflation: event.budgetInflation,
          genreBoost: event.genreBoost,
          desc: event.desc,
        });
        log.push({ text: `ZEITGEIST: ${event.name} begins! ${event.desc}`, type: 'info' });
      }
      // Apply zeitgeist bonuses to released films this month
      activeZeitgeist.forEach(z => {
        films.filter(f => f.status === 'released' && f.releasedYear === state.year && f.releasedMonth === state.month).forEach(film => {
          if (z.genreBoost[film.genre]) {
            const bonus = Math.round(film.totalGross * z.genreBoost[film.genre]);
            film.totalGross += bonus;
            film.profit += bonus;
            revenue += bonus;
            log.push({ text: `"${film.title}" got zeitgeist boost: +${fmt(bonus)}`, type: 'info' });
          }
        });
      });

      // SYSTEM 9: Distribution Tier Effects (already applied in release, but here we can apply monthly effects)
      // Theater relationship degradation (time-based)
      let theaterRelationship = state.theaterRelationship;
      if (state.distributionTier === 'self' || state.distributionTier === 'indie') {
        theaterRelationship = Math.max(0, theaterRelationship - 1); // slow decay for indie
      }

      // FEATURE 3: Year-End Summary (when month transitions to 1 of next year)
      let pendingYearSummary = null;
      if (newMonth === 1 && newYear > state.year) {
        const yearFilms = films.filter(f => f.status === 'released' && f.releasedYear === state.year);
        const yearGross = yearFilms.reduce((s, f) => s + (f.totalGross || 0), 0);
        const bestFilm = yearFilms.sort((a, b) => (b.totalGross || 0) - (a.totalGross || 0))[0];
        const worstFilm = yearFilms.sort((a, b) => (a.quality || 0) - (b.quality || 0))[0];
        const yearAwards = awards.filter(a => a.year === state.year).length;
        pendingYearSummary = {
          year: state.year,
          filmsReleased: yearFilms.length,
          totalGross: yearGross,
          bestFilm: bestFilm ? { title: bestFilm.title, gross: bestFilm.totalGross, quality: bestFilm.quality } : null,
          worstFilm: worstFilm && yearFilms.length > 1 ? { title: worstFilm.title, gross: worstFilm.totalGross, quality: worstFilm.quality } : null,
          awardsWon: yearAwards,
          reputation: Math.round(rep),
          prestige: Math.round(pres),
          competitorCount: competitors.length,
          cashChange: cash - state.cash,
        };
        // Add year summary data to turn summary for display
        turnSummaryData.yearSummary = pendingYearSummary;
      }

      // FEATURE 7: Studio Genre Identity (update when films are released)
      let genreIdentity = { ...(state.genreIdentity || {}) };
      films.forEach(f => {
        if (f.status === 'released' && f.releasedYear === state.year && f.releasedMonth === state.month) {
          const gi = genreIdentity[f.genre] || { films: 0, reputation: 0 };
          gi.films += 1;
          gi.reputation = clamp(gi.reputation + (f.quality >= 70 ? 5 : f.quality >= 50 ? 2 : -3), 0, 100);
          genreIdentity[f.genre] = gi;
          if (f.genre2) {
            const gi2 = genreIdentity[f.genre2] || { films: 0, reputation: 0 };
            gi2.films += 1;
            gi2.reputation = clamp(gi2.reputation + (f.quality >= 70 ? 3 : f.quality >= 50 ? 1 : -2), 0, 100);
            genreIdentity[f.genre2] = gi2;
          }
        }
      });

      // Build Turn Summary with collected data
      const turnSummary = {
        sections: turnSummaryData,
        turnNum: state.turn + 1,
        year: newYear,
        month: newMonth,
      };

      // Newspaper priority system — pick AT MOST 1 newspaper
      let singleNewspaper = null;
      const tier1Events = newspaperQueue.filter(n => ['hostile_takeover', 'strike', 'pandemic', 'game_over'].some(t => n.type === t || (n.headline && n.headline.includes('Takeover'))));
      const tier2Events = newspaperQueue.filter(n => ['award_sweep', 'box_office_1b', 'acquisition', 'ipo'].some(t => n.type === t));
      const tier3Events = newspaperQueue.filter(n => ['major_flop', 'era_transition', 'subscribers_milestone', 'box_office_500m'].some(t => n.type === t));

      if (tier1Events.length > 0) singleNewspaper = tier1Events[0];
      else if (tier2Events.length > 0) singleNewspaper = tier2Events[0];
      else if (tier3Events.length > 0) singleNewspaper = tier3Events[0];

      // Tab badges — count events per tab
      const tabBadges = {};
      if (turnSummaryData.boxOffice.length > 0) tabBadges.release = (tabBadges.release || 0) + turnSummaryData.boxOffice.length;
      if (turnSummaryData.production.length > 0) tabBadges.production = (tabBadges.production || 0) + turnSummaryData.production.length;
      if (turnSummaryData.talent.length > 0) tabBadges.talent = (tabBadges.talent || 0) + turnSummaryData.talent.length;
      if (turnSummaryData.market.length > 0) tabBadges.market = (tabBadges.market || 0) + turnSummaryData.market.length;
      if (turnSummaryData.streaming.length > 0) tabBadges.streaming = (tabBadges.streaming || 0) + turnSummaryData.streaming.length;
      if (turnSummaryData.rivals.length > 0) tabBadges.market = (tabBadges.market || 0) + turnSummaryData.rivals.length;

      return {
        ...state,
        phase,
        year: newYear,
        month: newMonth,
        turn: state.turn + 1,
        cash,
        reputation: clamp(Math.round(rep), 0, 100),
        prestige: clamp(Math.round(pres), 0, 100),
        films,
        awards,
        franchises,
        contracts,
        streamingPlatform: streaming,
        milestones,
        totalGross: tGross,
        totalAwards: tAwards,
        totalFilmsReleased,
        unlockedAchievements,
        loans,
        distributionDeal: distDeal,
        distributionTurnsLeft: distTurns,
        competitors,
        rivalFilms: rivalFilmsThisQ,
        rivalFilmsThisYear,
        allFilmHistory,
        annualAwards,
        boxOfficeChart,
        legacyScore,
        pendingCeremony,
        showCeremony: pendingCeremony !== null,
        availableTalent: [...newAvail, ...schoolGraduates],
        scripts: newScripts,
        ipMarketplace: refreshedIPMarketplace,
        pendingScreenplays: updatedPendingScreenplays,
        genreTrends: trends,
        genreFanbase,
        nextId: newNextId,
        devScriptIdx: -1,
        errorMsg: '',
        cashHistory: [...state.cashHistory, { turn: state.turn + 1, year: newYear, month: newMonth, cash, revenue: Math.round(revenue), expenses: Math.round(expenses) }],
        gameLog: log,
        // New feature state
        themeParks,
        theaterChains,
        tvShows,
        academy,
        isPublic,
        stockPrice,
        stockHistory,
        shareholderDemand,
        hostileTakeoverOffer,
        takeoverCooldown,
        takeoverWarningLevel,
        stockPricePeak,
        consecutiveFlops,
        activeMovements,
        activeCrises,
        coProductions,
        merchandiseRevenue: state.merchandiseRevenue + merchRev,
        soundtrackRevenue: state.soundtrackRevenue + soundtrackRev,
        scenarioWon,
        // Batch 4 features
        pressEvents,
        filmSchools,
        internationalPartners: intlPartners,
        // New systems features
        genreCycleState,
        genreFatigueLog,
        talentMoods,
        catalogRevenue: catalogRevenue,
        cinematicUniverses,
        activeZeitgeist: activeZeitgeist,
        theaterRelationship,
        studioFacilities: state.studioFacilities,
        awardsCampaignsDetailed: state.awardsCampaignsDetailed,
        pendingYearSummary,
        showYearSummary: false, // Year summary now merged into Turn Summary panel
        genreIdentity,
        // TV/Streaming expansion
        licensingDeals: licensingDeals || [],
        rivalStreamers,
        streamingHistory: (state.streamingHistory || []).concat(streaming ? [{ turn: state.turn + 1, subscribers: streaming.subscribers, revenue: streaming.monthlyRevenue, churn: Math.round((streaming.churnRate || 0.04) * 100), contentCount: streaming.contentLibrary }] : []),
        // SYSTEM 1: Filmmaking Eras
        currentFilmEra,
        // SYSTEM 2: Acquisitions
        acquisitions: state.acquisitions,
        // SYSTEM 3: Economic & Events
        economicCycle,
        worldEventsTriggered,
        aiStudiosSpawned,
        laborRelations: state.laborRelations,
        // SYSTEM 4: Talent
        talentRelationships,
        talentCareerStages: state.talentCareerStages,
        // ---- AI COMPETITION SYSTEMS ----
        rivalMarketShare: playerGenreShare,
        rivalStrategies,
        rivalAlliances,
        rivalAcquisitions,
        activeEspionage,
        playerEspionage: (state.playerEspionage || []).map(e => ({ ...e, monthsLeft: e.monthsLeft - 1 })).filter(e => e.monthsLeft > 0),
        studioSecurity: Math.max(0, (state.studioSecurity || 0) - 1),
        industryCoalitions: (state.industryCoalitions || []).map(c => ({ ...c, monthsLeft: c.monthsLeft - 1 })).filter(c => c.monthsLeft > 0),
        activeRegulations: (state.activeRegulations || []).map(r => ({ ...r, monthsLeft: r.monthsLeft - 1 })).filter(r => r.monthsLeft > 0),
        playerCoalition: state.playerCoalition,
        twinFilmWarnings: state.twinFilmWarnings || [],
        espionageLog,
        difficultyScale,
        // Newspaper system
        newspaperQueue: singleNewspaper ? [singleNewspaper] : [],
        newspaperArchive: [...(state.newspaperArchive || []), ...newspaperQueue.filter(n => n !== singleNewspaper)].slice(-50),
        newspaperEdition,
        celebration,
        walkOfFame,
        // Turn Summary system
        turnSummary,
        showTurnSummary: true,
        turnSummaryExpanded: {},
        tabBadges,
        logFilter: 'all',
      };
    }

    // ==================== SYSTEM 1: GENRE TRENDS & CYCLES ====================
    case 'UPDATE_GENRE_CYCLE': {
      const state2 = { ...state };
      state2.genreCycleState = { ...state.genreCycleState };
      const genre = action.genre;
      const current = state2.genreCycleState[genre] || { phase: 'stable', momentum: 0, filmsThisYear: 0 };
      const updated = { ...current };
      updated.momentum = clamp(updated.momentum + (action.momentumDelta || 0), -100, 100);
      const phases = ['fatigued', 'declining', 'stable', 'rising', 'boom'];
      const phaseIdx = Math.max(0, Math.min(4, Math.round((updated.momentum + 100) / 50)));
      updated.phase = phases[phaseIdx];
      state2.genreCycleState[genre] = updated;
      return state2;
    }

    // ==================== SYSTEM 2: TALENT RELATIONSHIPS ====================
    case 'NEGOTIATE_SALARY': {
      const talent = state.contracts.find(t => t.id === action.talentId);
      if (!talent) return state;
      const demand = calcSalaryDemand(talent);
      const offer = action.offer;
      const diff = offer / demand;
      let accepted = diff >= 0.9;
      if (diff >= 0.8 && Math.random() < 0.5) accepted = true;
      if (!accepted) {
        return {
          ...state,
          gameLog: [...state.gameLog, { text: `${talent.name} rejected your offer of ${fmt(offer)} (demanded ${fmt(demand)}).`, type: 'warning' }],
        };
      }
      const contracts = state.contracts.map(t => t.id === action.talentId ? { ...t, salary: offer, loyalty: (t.loyalty || 0) + (diff >= 1.1 ? 5 : diff >= 1 ? 2 : -3) } : t);
      return {
        ...state,
        contracts,
        gameLog: [...state.gameLog, { text: `${talent.name} accepted ${fmt(offer)}/film.${diff >= 1.1 ? ' They\'re thrilled!' : ''}`, type: 'success' }],
      };
    }

    case 'GRANT_PERK': {
      const perk = TALENT_PERKS.find(p => p.id === action.perkId);
      if (!perk) return state;
      const contracts = state.contracts.map(t => {
        if (t.id !== action.talentId) return t;
        const existing = t.perks || [];
        if (existing.includes(action.perkId)) return t;
        return { ...t, perks: [...existing, action.perkId], loyalty: (t.loyalty || 0) + 3 };
      });
      return {
        ...state,
        cash: state.cash - (perk.cost || 0),
        contracts,
        gameLog: [...state.gameLog, { text: `Granted "${perk.name}" perk to talent. ${perk.cost ? `Cost: ${fmt(perk.cost)}` : 'No cost.'}`, type: 'info' }],
      };
    }

    // ==================== SYSTEM 3: AWARDS CAMPAIGNS ====================
    case 'LAUNCH_AWARDS_CAMPAIGN': {
      const film = state.films.find(f => f.id === action.filmId);
      if (!film || film.status !== 'released') return state;
      const strategy = CAMPAIGN_STRATEGIES.find(s => s.id === action.strategy);
      if (!strategy) return state;
      const baseCost = 2000000;
      const cost = Math.round(baseCost * strategy.costMult);
      if (state.cash < cost) return { ...state, gameLog: [...state.gameLog, { text: `Can't afford ${fmt(cost)} awards campaign!`, type: 'warning' }] };
      const campaigns = { ...state.awardsCampaignsDetailed };
      campaigns[action.filmId] = {
        strategy: action.strategy,
        spent: cost,
        categories: action.categories || ['bestPicture'],
        effectMult: strategy.effectMult,
      };
      return {
        ...state,
        cash: state.cash - cost,
        awardsCampaignsDetailed: campaigns,
        gameLog: [...state.gameLog, { text: `Launched ${strategy.name} for "${film.title}" — ${fmt(cost)} invested.`, type: 'info' }],
      };
    }

    // ==================== SYSTEM 5: CINEMATIC UNIVERSES ====================
    case 'CREATE_UNIVERSE': {
      const id = state.nextId;
      const universe = {
        id,
        name: action.name,
        franchiseIds: action.franchiseIds || [],
        tier: 'shared',
        brandHealth: 100,
        totalGross: 0,
        filmCount: 0,
      };
      return {
        ...state,
        cinematicUniverses: [...state.cinematicUniverses, universe],
        nextId: id + 1,
        gameLog: [...state.gameLog, { text: `Founded the "${action.name}" cinematic universe!`, type: 'success' }],
      };
    }

    case 'ADD_FRANCHISE_TO_UNIVERSE': {
      const universes = state.cinematicUniverses.map(u => {
        if (u.id !== action.universeId) return u;
        if (u.franchiseIds.includes(action.franchiseId)) return u;
        const newIds = [...u.franchiseIds, action.franchiseId];
        const tier = UNIVERSE_TIERS.slice().reverse().find(t => newIds.length >= t.minFilms) || UNIVERSE_TIERS[0];
        return { ...u, franchiseIds: newIds, tier: tier.id };
      });
      return { ...state, cinematicUniverses: universes };
    }

    // ==================== SYSTEM 7: STUDIO FACILITIES ====================
    case 'BUILD_FACILITY': {
      const facility = STUDIO_FACILITIES.find(f => f.id === action.facilityId);
      if (!facility || state.cash < facility.cost) return { ...state, gameLog: [...state.gameLog, { text: `Can't afford ${facility.name} (${fmt(facility.cost)})`, type: 'warning' }] };
      const newFacility = { id: state.nextId, facilityId: action.facilityId, built: state.turn };
      return {
        ...state,
        cash: state.cash - facility.cost,
        studioFacilities: [...state.studioFacilities, newFacility],
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Built ${facility.name} for ${fmt(facility.cost)}!`, type: 'success' }],
      };
    }

    case 'DEMOLISH_FACILITY': {
      const fac = state.studioFacilities.find(f => f.id === action.id);
      if (!fac) return state;
      const def = STUDIO_FACILITIES.find(sf => sf.id === fac.facilityId);
      const salvage = def ? Math.round(def.cost * 0.3) : 0;
      return {
        ...state,
        cash: state.cash + salvage,
        studioFacilities: state.studioFacilities.filter(f => f.id !== action.id),
        gameLog: [...state.gameLog, { text: `Demolished ${def?.name || 'facility'} for ${fmt(salvage)} salvage.`, type: 'info' }],
      };
    }

    // ==================== SYSTEM 9: DISTRIBUTION ====================
    case 'SET_DISTRIBUTION_TIER': {
      const tier = DISTRIBUTION_TIERS.find(t => t.id === action.tier);
      if (!tier) return state;
      return {
        ...state,
        distributionTier: action.tier,
        gameLog: [...state.gameLog, { text: `Distribution deal: ${tier.name} — ${tier.desc}`, type: 'info' }],
      };
    }

    case 'NEGOTIATE_THEATER_TERMS': {
      const terms = THEATER_NEGOTIATIONS.find(t => t.id === action.termsId);
      if (!terms) return state;
      let rel = state.theaterRelationship;
      if (terms.id === 'aggressive') rel -= 10;
      if (terms.id === 'generous') rel += 10;
      return {
        ...state,
        theaterRelationship: clamp(rel, 0, 100),
        gameLog: [...state.gameLog, { text: `Theater terms: ${terms.name} (${terms.studioSharePct}% studio share)`, type: 'info' }],
      };
    }

    // ==================== BATCH 4 FEATURE ACTIONS ====================

    case 'HANDLE_PRESS': {
      const event = state.pressEvents.find(e => e.id === action.eventId);
      if (!event) return state;
      const response = PRESS_RESPONSES.find(r => r.id === action.response);
      if (!response) return state;

      let repChange = event.repChange || 0;
      let buzzChange = event.buzzChange || 0;
      let presChange = event.prestigeChange || 0;

      // Response modifiers
      if (action.response === 'ignore') {
        repChange = Math.round(repChange * 0.3);
        buzzChange = Math.round(buzzChange * 0.5);
        presChange = Math.round(presChange * 0.2);
      } else if (action.response === 'deny') {
        if (Math.random() < 0.4) {
          repChange = repChange * 2; // backfire
          buzzChange = Math.round(buzzChange * 1.5);
        } else {
          repChange = Math.round(repChange * 0.6);
        }
      } else if (action.response === 'leanIn') {
        buzzChange = Math.round(buzzChange * 1.8);
        presChange = Math.round(presChange * 0.7);
        repChange = Math.round(repChange * 0.5);
      } else if (action.response === 'apologize') {
        repChange = Math.round(repChange * 0.3);
        buzzChange = Math.round(buzzChange * 0.4);
        presChange = Math.round(presChange * 1.2);
      }

      return {
        ...state,
        reputation: clamp(state.reputation + repChange, 0, 100),
        prestige: clamp(state.prestige + presChange, 0, 100),
        pressEvents: state.pressEvents.filter(e => e.id !== action.eventId),
        gameLog: [...state.gameLog, {
          text: `Press event: ${event.name} — Response: ${response.name}. Rep ${repChange > 0 ? '+' : ''}${repChange}, Pres ${presChange > 0 ? '+' : ''}${presChange}`,
          type: repChange > 0 ? 'success' : 'warning',
        }],
      };
    }

    case 'FUND_SCHOOL': {
      const school = FILM_SCHOOLS.find(s => s.id === action.schoolId);
      if (!school) return state;
      if (state.cash < school.cost) return { ...state, errorMsg: `Not enough cash to fund ${school.name}!` };
      if (state.filmSchools.some(fs => fs.schoolId === action.schoolId)) return { ...state, errorMsg: 'Already operating this school!' };

      const newSchool = {
        id: state.nextId,
        schoolId: action.schoolId,
        founded: state.turn,
        nextGraduate: state.turn + school.graduateInterval,
        graduatesQueue: [],
      };

      return {
        ...state,
        cash: state.cash - school.cost,
        filmSchools: [...state.filmSchools, newSchool],
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Funded ${school.name}! Graduates arrive in ~${school.graduateInterval} months.`, type: 'success' }],
      };
    }

    case 'GRADUATE_TALENT': {
      const school = state.filmSchools.find(fs => fs.id === action.schoolId);
      const schoolDef = school ? FILM_SCHOOLS.find(s => s.id === school.schoolId) : null;
      if (!school || !schoolDef) return state;

      // Generate graduate talent
      const talentType = pick(['director', 'actor', 'writer']);
      const qualityRange = schoolDef.talentQualityRange;
      const skill = Math.round(qualityRange[0] + Math.random() * (qualityRange[1] - qualityRange[0]));
      const salary = Math.round(1000000 * schoolDef.salaryMult * (skill / 60)); // scale with skill

      const talent = makeTalent(state.nextId, talentType, [skill, skill], salary);

      return {
        ...state,
        availableTalent: [...state.availableTalent, talent],
        filmSchools: state.filmSchools.map(fs =>
          fs.id === action.schoolId
            ? { ...fs, nextGraduate: state.turn + schoolDef.graduateInterval }
            : fs
        ),
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `${schoolDef.name} graduate: ${talent.name} (${talent.type}, skill ${skill}). Salary: ${fmt(talent.salary)}`, type: 'info' }],
      };
    }

    case 'FORM_PARTNERSHIP': {
      const partner = INTERNATIONAL_PARTNERS.find(p => p.id === action.partnerId);
      if (!partner) return state;
      if (state.internationalPartners.some(ip => ip.partnerId === action.partnerId)) return { ...state, errorMsg: 'Already in partnership with this studio!' };

      const newPartner = {
        id: state.nextId,
        partnerId: action.partnerId,
        formDate: state.year,
        active: true,
      };

      return {
        ...state,
        internationalPartners: [...state.internationalPartners, newPartner],
        nextId: state.nextId + 1,
        gameLog: [...state.gameLog, { text: `Formed partnership with ${partner.name}! Monthly fee: ${fmt(partner.monthlyFee)}. Bonuses for ${partner.genres.join(', ')}`, type: 'success' }],
      };
    }

    case 'DISSOLVE_PARTNERSHIP': {
      const partner = state.internationalPartners.find(ip => ip.id === action.partnerId);
      if (!partner) return state;
      const partnerDef = INTERNATIONAL_PARTNERS.find(p => p.id === partner.partnerId);

      return {
        ...state,
        internationalPartners: state.internationalPartners.filter(ip => ip.id !== action.partnerId),
        gameLog: [...state.gameLog, { text: `Dissolved partnership with ${partnerDef?.name}. No more monthly fees or bonuses.`, type: 'warning' }],
      };
    }

    // ==================== SYSTEM 2: ACQUISITIONS ====================
    case 'ACQUIRE_TARGET': {
      const target = ACQUISITION_TARGETS.find(t => t.id === action.targetId);
      if (!target) return state;
      const cost = Math.round(target.baseCost * (1 + Math.random() * 0.3));
      if (state.cash < cost) return { ...state, errorMsg: `Need ${fmt(cost)} to acquire ${target.name}.` };
      if ((state.acquisitions || []).find(a => a.id === target.id)) return { ...state, errorMsg: 'Already acquired!' };
      return {
        ...state,
        cash: state.cash - cost,
        acquisitions: [...(state.acquisitions || []), { id: target.id, name: target.name, type: target.type, effect: target.benefitEffect, acquiredYear: state.year }],
        gameLog: [...state.gameLog, { text: `Acquired ${target.name} for ${fmt(cost)}! ${target.benefit}`, type: 'success' }],
        errorMsg: '',
      };
    }

    case 'PROPOSE_COPRODUCTION': {
      const rival = state.competitors.find(c => c.name === action.rivalName);
      if (!rival) return state;
      const film = state.films.find(f => f.id === action.filmId && f.status === 'development');
      if (!film) return state;
      const willingness = clamp(rival.reputation * 0.5 + state.reputation * 0.3 + (Math.random() - 0.3) * 40, 0, 100);
      if (willingness < 40) {
        return { ...state, gameLog: [...state.gameLog, { text: `${rival.name} declined your co-production offer for "${film.title}".`, type: 'warning' }] };
      }
      const costShare = 0.3 + Math.random() * 0.2;
      const profitShare = costShare + 0.05;
      const savings = Math.round(film.budget * costShare);
      return {
        ...state,
        cash: state.cash + savings,
        coProductions: [...(state.coProductions || []), { filmId: film.id, rivalName: rival.name, costShare, profitShare, active: true }],
        gameLog: [...state.gameLog, { text: `${rival.name} agreed to co-produce "${film.title}"! They cover ${Math.round(costShare * 100)}% of costs (${fmt(savings)} savings) for ${Math.round(profitShare * 100)}% of profits.`, type: 'success' }],
        errorMsg: '',
      };
    }

    // ==================== SYSTEM 3: LABOR RELATIONS ====================
    case 'SET_LABOR_POLICY': {
      const policies = {
        generous: { cost: 2e6, shift: 'up', desc: 'Generous benefits package' },
        standard: { cost: 0, shift: 'none', desc: 'Standard terms' },
        lean: { cost: -1e6, shift: 'down', desc: 'Cost-cutting measures' },
      };
      const policy = policies[action.policy];
      if (!policy) return state;
      const levels = ['hostile', 'poor', 'neutral', 'good', 'excellent'];
      const currentIdx = levels.indexOf(state.laborRelations);
      let newIdx = currentIdx;
      if (policy.shift === 'up') newIdx = Math.min(currentIdx + 1, 4);
      if (policy.shift === 'down') newIdx = Math.max(currentIdx - 1, 0);
      return {
        ...state,
        cash: state.cash - policy.cost,
        laborRelations: levels[newIdx],
        gameLog: [...state.gameLog, { text: `Labor policy: ${policy.desc}. Relations now: ${levels[newIdx]}.`, type: 'info' }],
        errorMsg: '',
      };
    }

    // ==================== SYSTEM 4: TALENT RELATIONSHIPS ====================
    case 'NEGOTIATE_TALENT_DEAL': {
      const talent = state.availableTalent.find(t => t.id === action.talentId);
      if (!talent) return state;
      const relationship = (state.talentRelationships || {})[talent.id] || 50;
      const salaryMult = 1 + Math.random() * 0.5 - (relationship > 70 ? 0.15 : 0);
      const counterSalary = Math.round(talent.salary * salaryMult);
      const wantsExclusive = talent.skill >= 80 && Math.random() < 0.3;
      const wantsBackend = talent.skill >= 70 && Math.random() < 0.4;
      const perks = [];
      if (talent.skill >= 60 && Math.random() < 0.5) perks.push(pick(['Private trailer on all sets', 'First-class travel', 'Creative control clause', 'Personal chef on set']));
      if (wantsBackend) perks.push('Profit participation (3-5%)');
      return {
        ...state,
        pendingDealNegotiation: {
          talentId: talent.id,
          originalSalary: talent.salary,
          counterOffer: counterSalary,
          exclusive: wantsExclusive,
          perks,
          talentName: talent.name,
          dealTypes: AGENT_DEAL_TYPES.filter(d => {
            if (d.id === 'exclusive' && talent.skill < 75) return false;
            if (d.id === 'backend' && talent.skill < 60) return false;
            return true;
          }),
          relationship,
        },
      };
    }

    // ==================== AI COMPETITION: PLAYER ACTIONS ====================

    case 'DEFEND_TAKEOVER': {
      if (!state.hostileTakeoverOffer) return state;
      const cost = state.hostileTakeoverOffer.defenseCost || Math.round(state.hostileTakeoverOffer.offer * 0.3);
      if (state.cash < cost) return { ...state, errorMsg: `Need ${fmt(cost)} to fight the takeover!` };
      const defEdition = (state.newspaperEdition || 0) + 1;
      return {
        ...state,
        cash: state.cash - cost,
        hostileTakeoverOffer: null,
        takeoverCooldown: 18,
        takeoverWarningLevel: 0,
        reputation: clamp(state.reputation + 5, 0, 100),
        gameLog: [...state.gameLog, { text: `Successfully defended against hostile takeover! Cost: ${fmt(cost)}. Your defiance boosted reputation. (Rivals won't attempt another for 18 months.)`, type: 'success' }],
        errorMsg: '',
        newspaperEdition: defEdition,
        newspaperQueue: [...(state.newspaperQueue || []), makeNewspaper('takeover_defense', { studio: state.studioName, buyer: state.hostileTakeoverOffer.buyer, cost: fmt(cost) }, state.year, state.month, defEdition)].filter(Boolean),
      };
    }

    case 'LAUNCH_ESPIONAGE': {
      const espAction = PLAYER_ESPIONAGE.find(e => e.id === action.espionageId);
      if (!espAction) return state;
      if (state.cash < espAction.cost) return { ...state, errorMsg: `Need ${fmt(espAction.cost)} for ${espAction.name}.` };

      if (espAction.id === 'counter_intel') {
        return {
          ...state,
          cash: state.cash - espAction.cost,
          studioSecurity: clamp((state.studioSecurity || 0) + 20, 0, 100),
          gameLog: [...state.gameLog, { text: `Invested ${fmt(espAction.cost)} in counter-intelligence. Security level increased.`, type: 'success' }],
        };
      }

      const success = Math.random() < espAction.successChance;
      const caught = Math.random() < espAction.caughtChance;
      let logMsg = '';
      let newState = { ...state, cash: state.cash - espAction.cost };

      if (success) {
        const targetRival = action.targetRival ? state.competitors.find(c => c.name === action.targetRival) : pick(state.competitors);
        if (espAction.id === 'spy_development') {
          const rivalFilmsInDev = (state.allFilmHistory || []).filter(f => f.studio === targetRival?.name).slice(-3);
          logMsg = `Intelligence gathered on ${targetRival?.name}. They favor: ${rivalFilmsInDev.map(f => f.genre).join(', ') || 'unknown genres'}.`;
        } else if (espAction.id === 'poach_talent') {
          const stolenTalent = makeTalent(state.nextId, pick(['actor', 'director', 'writer']), [65, 90]);
          stolenTalent.name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
          newState = { ...newState, contracts: [...state.contracts, stolenTalent], nextId: state.nextId + 1 };
          logMsg = `Poached ${stolenTalent.name} (${stolenTalent.type}, skill ${stolenTalent.skill}) from ${targetRival?.name}!`;
        } else if (espAction.id === 'plant_mole') {
          newState = { ...newState, playerEspionage: [...(state.playerEspionage || []), { type: 'mole', targetRival: targetRival?.name, monthsLeft: 12, active: true }] };
          logMsg = `Mole planted at ${targetRival?.name}. You'll get early warnings on their releases for 12 months.`;
        } else if (espAction.id === 'sabotage_marketing') {
          const updated = state.competitors.map(c => c.name === targetRival?.name ? { ...c, reputation: clamp(c.reputation - 5, 10, 95) } : c);
          newState = { ...newState, competitors: updated };
          logMsg = `Sabotaged ${targetRival?.name}'s marketing campaign. Their reputation dropped.`;
        }
      } else {
        logMsg = `${espAction.name} operation against ${action.targetRival || 'a rival'} failed.`;
      }

      if (caught) {
        newState.reputation = clamp(newState.reputation - espAction.repPenalty, 0, 100);
        logMsg += ` YOU WERE CAUGHT! -${espAction.repPenalty} reputation.`;
      }

      return {
        ...newState,
        espionageLog: [...(state.espionageLog || []), { turn: state.turn, type: espAction.id, rival: action.targetRival, result: success ? 'success' : 'failed', caught, desc: logMsg }],
        gameLog: [...newState.gameLog, { text: `ESPIONAGE: ${logMsg}`, type: caught ? 'warning' : success ? 'success' : 'info' }],
        errorMsg: '',
      };
    }

    case 'JOIN_COALITION': {
      const coalition = INDUSTRY_COALITIONS.find(c => c.id === action.coalitionId);
      if (!coalition) return state;
      if (state.playerCoalition === action.coalitionId) return { ...state, errorMsg: 'Already in this coalition!' };
      return {
        ...state,
        playerCoalition: action.coalitionId,
        gameLog: [...state.gameLog, { text: `Joined the ${coalition.name}. ${coalition.desc}`, type: 'success' }],
        errorMsg: '',
      };
    }

    case 'LEAVE_COALITION': {
      return {
        ...state,
        playerCoalition: null,
        gameLog: [...state.gameLog, { text: 'Left the industry coalition.', type: 'info' }],
        errorMsg: '',
      };
    }

    case 'LOBBY_REGULATION': {
      const reg = LOBBY_REGULATIONS.find(r => r.id === action.regulationId);
      if (!reg) return state;
      const cost = 10e6;
      if (state.cash < cost) return { ...state, errorMsg: `Need ${fmt(cost)} to lobby.` };
      const success = Math.random() < 0.4 + (state.reputation / 200);
      if (!success) {
        return { ...state, cash: state.cash - cost, gameLog: [...state.gameLog, { text: `Lobbying for ${reg.name} failed. ${fmt(cost)} spent.`, type: 'warning' }] };
      }
      return {
        ...state,
        cash: state.cash - cost,
        activeRegulations: [...(state.activeRegulations || []), { id: reg.id, name: reg.name, monthsLeft: randInt(24, 48), effects: reg.effect }],
        gameLog: [...state.gameLog, { text: `Successfully lobbied for ${reg.name}! ${reg.desc}`, type: 'success' }],
        errorMsg: '',
      };
    }

    case 'UPGRADE_SECURITY': {
      const cost = 5e6;
      if (state.cash < cost) return { ...state, errorMsg: `Need ${fmt(cost)} for security upgrade.` };
      return {
        ...state,
        cash: state.cash - cost,
        studioSecurity: clamp((state.studioSecurity || 0) + 10, 0, 100),
        gameLog: [...state.gameLog, { text: `Studio security upgraded to ${(state.studioSecurity || 0) + 10}%. Espionage defense improved.`, type: 'success' }],
        errorMsg: '',
      };
    }

    default: return state;
  }
}

// ==================== COMPONENTS ====================

function StatBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="text-white font-bold mb-2">{value}/{max}</div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

function FilmCard({ film }) {
  const phaseColors = { script_dev: 'bg-yellow-600', pre_production: 'bg-orange-600', principal_photography: 'bg-blue-600', post_production: 'bg-purple-600', marketing_campaign: 'bg-pink-600', development: 'bg-yellow-600', production: 'bg-blue-600', postproduction: 'bg-purple-600', completed: 'bg-green-600', scheduled: 'bg-teal-600' };
  const phaseNames = { script_dev: 'Script Dev', pre_production: 'Pre-Production', principal_photography: 'Filming', post_production: 'Post-Production', marketing_campaign: 'Marketing', development: 'Development', production: 'Production', postproduction: 'Post-Prod', completed: 'Complete', scheduled: 'Scheduled' };
  const phase = film.productionPhase || film.status;
  const pct = film.turnsNeeded > 0 ? Math.round((film.turnsInStatus / film.turnsNeeded) * 100) : 0;

  // Show production pipeline progress bar (all 5 phases)
  const phases = ['script_dev', 'pre_production', 'principal_photography', 'post_production', 'marketing_campaign'];
  const currentPhaseIdx = phases.indexOf(phase);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-white font-bold">{film.title}</div>
          <div className="text-amber-400 text-xs">{film.genre}{film.genre2 ? <span className="text-purple-400"> / {film.genre2}</span> : ''}</div>
        </div>
        <span className={`text-xs text-white px-2 py-0.5 rounded ${phaseColors[phase] || 'bg-gray-600'}`}>
          {phaseNames[phase] || film.status}
        </span>
      </div>
      {/* Multi-phase progress bar */}
      {currentPhaseIdx >= 0 && (
        <div className="flex gap-0.5 mb-2">
          {phases.map((p, i) => (
            <div key={p} className="flex-1 h-2 rounded-sm overflow-hidden bg-gray-700">
              <div className={`h-full ${i < currentPhaseIdx ? 'bg-green-500' : i === currentPhaseIdx ? 'bg-blue-400' : 'bg-gray-700'}`}
                style={{ width: i === currentPhaseIdx ? `${pct}%` : '100%' }}></div>
            </div>
          ))}
        </div>
      )}
      {currentPhaseIdx < 0 && (
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div className="bg-blue-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
        </div>
      )}
      <div className="text-xs text-gray-400 space-y-0.5">
        <div>Director: {film.director?.name} ({film.director?.skill}) {film.director?.genreBonus === film.genre ? <span className="text-green-400">★</span> : ''} {film.director?.trait && <span className="text-purple-300">— {film.director.trait}</span>}</div>
        <div>Lead: {film.actor?.name} ({film.actor?.skill}) {film.castMembers && film.castMembers.length > 1 ? <span className="text-blue-400">+{film.castMembers.length - 1} cast</span> : ''} {film.actor?.trait && <span className="text-purple-300">— {film.actor.trait}</span>}</div>
        <div>Writer: {film.writer?.name} ({film.writer?.skill}) {film.writer?.trait && <span className="text-purple-300">— {film.writer.trait}</span>}</div>
        <div>Budget: {fmt(film.budget)} | Marketing: {fmt(film.marketing)}</div>
        {/* Production events from filming */}
        {film.productionEvents && film.productionEvents.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {film.productionEvents.map((evt, i) => (
              <div key={i} className={`text-xs ${evt.qualMod > 0 ? 'text-green-400' : evt.qualMod < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                {evt.name} {evt.qualMod !== 0 ? `(${evt.qualMod > 0 ? '+' : ''}${evt.qualMod} quality)` : ''}
              </div>
            ))}
          </div>
        )}
        {film.events.length > 0 && <div className="text-yellow-400 mt-1">{film.events.join(', ')}</div>}
      </div>
    </div>
  );
}

function ReleasedCard({ film, onCreateFranchise, onRemaster, currentYear, currentCash, state }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-white font-bold text-lg">{film.title}</div>
          <div className="text-xs text-gray-400">{film.genre}{film.genre2 ? `/${film.genre2}` : ''} | {film.rating || 'NR'} | {MONTH_NAMES[(film.releasedMonth || 1) - 1]} {film.releasedYear}{film.releaseWindow ? ` · ${(RELEASE_WINDOWS[film.releasedMonth] || []).find(w => w.id === film.releaseWindow)?.name || ''}` : ''}</div>
          {film.themes && film.themes.length > 0 && (
            <div className="flex gap-1 mt-0.5">{film.themes.map(tid => { const th = FILM_THEMES.find(t => t.id === tid); return th ? <span key={tid} className="text-xs bg-teal-900/50 text-teal-300 px-1.5 py-0.5 rounded">{th.name}</span> : null; })}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-amber-400 font-bold text-xl">{film.quality}</div>
          <div className="text-xs text-gray-400">Quality</div>
          {film.isSleeper && <div className="text-xs text-amber-300 font-bold mt-1">SLEEPER HIT</div>}
        </div>
      </div>

      {/* Score divergence label */}
      {film.criticScore && film.audienceScore && (() => {
        const diff = film.criticScore - film.audienceScore;
        let label = null;
        if (film.criticScore >= 85 && film.audienceScore >= 85) label = { text: 'Universal Acclaim', color: 'text-green-400' };
        else if (film.criticScore < 30 && film.audienceScore < 30) label = { text: 'Universal Pan', color: 'text-red-400' };
        else if (diff >= 30) label = { text: 'Critics\' Darling', color: 'text-purple-400' };
        else if (diff <= -30) label = { text: 'Crowd-Pleaser', color: 'text-blue-400' };
        return label ? <div className={`text-xs ${label.color} font-bold mb-2`}>{label.text}</div> : null;
      })()}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="text-xs text-gray-400">Critics</div>
          <div className="w-full bg-gray-700 rounded h-2 mt-1">
            <div className={`h-2 rounded ${film.criticScore >= 80 ? 'bg-green-500' : film.criticScore >= 50 ? 'bg-purple-500' : 'bg-red-500'}`} style={{ width: `${film.criticScore}%` }}></div>
          </div>
          <div className={`text-xs mt-0.5 ${film.criticScore >= 80 ? 'text-green-400' : film.criticScore >= 50 ? 'text-purple-400' : 'text-red-400'}`}>{film.criticScore}/100</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Audience</div>
          <div className="w-full bg-gray-700 rounded h-2 mt-1">
            <div className={`h-2 rounded ${film.audienceScore >= 80 ? 'bg-green-500' : film.audienceScore >= 50 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${film.audienceScore}%` }}></div>
          </div>
          <div className={`text-xs mt-0.5 ${film.audienceScore >= 80 ? 'text-green-400' : film.audienceScore >= 50 ? 'text-blue-400' : 'text-red-400'}`}>{film.audienceScore}/100</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-700 rounded p-2">
          <div className="text-xs text-gray-400">Domestic</div>
          <div className="text-green-400 text-sm font-bold">{fmt(film.domestic)}</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-xs text-gray-400">International</div>
          <div className="text-green-400 text-sm font-bold">{fmt(film.international)}</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-xs text-gray-400">Profit</div>
          <div className={`text-sm font-bold ${film.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(film.profit)}</div>
        </div>
      </div>

      {film.theatricalRun && film.theatricalRun.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1 font-bold">Theatrical Run</div>
          <ResponsiveContainer width="100%" height={120}>
            <ComposedChart data={film.theatricalRun} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9CA3AF' }} interval={1} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v} width={35} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#F9FAFB' }}
                formatter={(value, name) => [fmt(value), name === 'gross' ? 'Weekly' : 'Cumulative']}
              />
              <Bar dataKey="gross" fill="#F59E0B" radius={[2, 2, 0, 0]} name="gross" />
              <Line type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2} dot={false} name="cumulative" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {film.status === 'released' && (film.quality || 0) >= 50 && (
        <div className="mt-2 border-t border-gray-700 pt-2">
          <div className="text-xs text-gray-400 font-bold mb-1">Remaster / Re-release</div>
          <div className="flex flex-wrap gap-1">
            {REMASTER_FORMATS.filter(r => currentYear >= r.minYear && currentYear <= r.maxYear && (film.quality || 0) >= r.qualityReq && !(film.remasters || []).includes(r.id)).map(r => (
              <button key={r.id} onClick={() => onRemaster(film.id, r.id)}
                disabled={currentCash < r.cost}
                className="bg-purple-800 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs px-2 py-1 rounded transition">
                {r.name} ({fmt(r.cost)})
              </button>
            ))}
            {(film.remasters || []).length > 0 && <span className="text-xs text-purple-400">Remastered: {(film.remasters || []).join(', ')}</span>}
          </div>
        </div>
      )}

      {film.totalGross >= 100000000 && film.franchiseId === null && (
        <button onClick={() => onCreateFranchise(film.id)} className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm py-1.5 rounded font-bold transition">
          Create Franchise
        </button>
      )}
      {film.franchiseId !== null && <div className="text-xs text-purple-400 text-center">Part of a franchise</div>}
    </div>
  );
}

function TalentCard({ talent, action, actionLabel, actionColor, disabled }) {
  const typeColors = { director: 'text-amber-400', actor: 'text-blue-400', writer: 'text-green-400' };
  const typeBg = { director: 'bg-amber-900/30 border-amber-700', actor: 'bg-blue-900/30 border-blue-700', writer: 'bg-green-900/30 border-green-700' };
  const skillTier = talent.skill >= 80 ? 'A-List' : talent.skill >= 60 ? 'Rising Star' : talent.skill >= 40 ? 'Working Pro' : 'Unknown';
  const tierColor = talent.skill >= 80 ? 'text-amber-300' : talent.skill >= 60 ? 'text-blue-300' : talent.skill >= 40 ? 'text-gray-300' : 'text-gray-500';
  const phase = getCareerPhase(talent.age);
  const phaseColor = { rising: 'text-green-400', peak: 'text-amber-400', veteran: 'text-blue-400', legend: 'text-purple-400', declining: 'text-red-400' };
  return (
    <div className={`border rounded-lg p-3 ${typeBg[talent.type] || 'bg-gray-800 border-gray-700'}`}>
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="text-white font-bold text-sm">{talent.name}</div>
          <span className={`text-xs font-bold uppercase ${typeColors[talent.type] || 'text-gray-400'}`}>{talent.type}</span>
          <span className={`text-xs ml-2 ${tierColor}`}>{skillTier}</span>
          <span className={`text-xs ml-2 ${phaseColor[phase.id] || 'text-gray-400'}`}>{phase.name}</span>
        </div>
      </div>
      <div className="text-xs text-gray-400 space-y-0.5 mb-1.5">
        <div className="flex gap-3 flex-wrap">
          <span>Skill: <span className="text-white">{talent.skill}</span></span>
          <span>Pop: <span className="text-white">{talent.popularity}</span></span>
          <span>Age: <span className={`${talent.age >= 55 ? 'text-red-300' : 'text-white'}`}>{talent.age}</span></span>
        </div>
        <div className="flex gap-3 flex-wrap">
          <span>Salary: <span className="text-green-400">{fmt(talent.salary)}/yr</span></span>
          {talent.contractYears !== undefined && <span>Contract: <span className={`${talent.contractYears <= 1 ? 'text-red-300' : 'text-white'}`}>{talent.contractYears}yr</span></span>}
        </div>
        {talent.morale !== undefined && (
          <div className="flex items-center gap-1">
            <span>Morale:</span>
            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${talent.morale >= 70 ? 'bg-green-400' : talent.morale >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${talent.morale}%` }}></div>
            </div>
            <span className={`${talent.morale >= 70 ? 'text-green-400' : talent.morale >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{talent.morale}</span>
          </div>
        )}
        <div className="text-amber-300">Genre bonus: {talent.genreBonus}</div>
      </div>
      {talent.trait && (
        <div className="bg-gray-900/50 rounded px-2 py-1 mb-2 border border-gray-600">
          <div className="text-xs text-purple-300 font-bold">{talent.trait}</div>
          <div className="text-xs text-gray-400">{talent.traitDesc}</div>
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
        <div className={`h-1.5 rounded-full ${talent.skill >= 80 ? 'bg-amber-400' : talent.skill >= 60 ? 'bg-blue-400' : 'bg-gray-400'}`} style={{ width: `${talent.skill}%` }}></div>
      </div>
      <button onClick={action} disabled={disabled} className={`w-full ${actionColor} text-white text-xs py-1.5 rounded font-bold transition hover:opacity-90 disabled:opacity-40`}>
        {actionLabel}
      </button>
    </div>
  );
}

// ==================== NEWSPAPER MODAL ====================
function NewspaperModal({ newspaper, onDismiss, onSkipAll, queueLength }) {
  if (!newspaper) return null;

  const eraStyle = newspaper.eraStyle || 'classic';

  // Era-appropriate styling
  const eraStyles = {
    classic: {
      bg: 'bg-amber-50',
      border: 'border-amber-900',
      headlineFont: 'font-serif',
      textColor: 'text-amber-950',
      accentColor: 'text-amber-800',
      mutedColor: 'text-amber-700',
      borderColor: 'border-amber-800',
      paperBg: 'linear-gradient(135deg, #f5e6c8 0%, #ebd5a7 25%, #f0deb5 50%, #e8d0a0 75%, #f2e0b8 100%)',
      ornament: true,
    },
    modern: {
      bg: 'bg-gray-50',
      border: 'border-gray-800',
      headlineFont: 'font-serif',
      textColor: 'text-gray-900',
      accentColor: 'text-gray-700',
      mutedColor: 'text-gray-500',
      borderColor: 'border-gray-700',
      paperBg: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 50%, #fafafa 100%)',
      ornament: false,
    },
    digital: {
      bg: 'bg-white',
      border: 'border-red-600',
      headlineFont: 'font-sans',
      textColor: 'text-gray-900',
      accentColor: 'text-red-600',
      mutedColor: 'text-gray-500',
      borderColor: 'border-red-600',
      paperBg: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
      ornament: false,
    },
  };

  const style = eraStyles[eraStyle] || eraStyles.classic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      {/* Newspaper container */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl"
        style={{
          background: style.paperBg,
          animation: 'newspaperSlideIn 0.6s ease-out',
        }}
      >
        {/* Fold line effect for classic era */}
        {eraStyle === 'classic' && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(90deg, transparent 49.5%, rgba(0,0,0,0.03) 49.5%, rgba(0,0,0,0.03) 50.5%, transparent 50.5%)',
          }} />
        )}

        <div className="p-6 md:p-8">
          {/* Masthead */}
          <div className={`text-center border-b-2 ${style.borderColor} pb-3 mb-4`}>
            {eraStyle === 'classic' && (
              <div className={`text-xs tracking-widest ${style.mutedColor} mb-1`}>★ EXTRA ★ EXTRA ★</div>
            )}
            {eraStyle === 'digital' && (
              <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 inline-block mb-2 tracking-wider">BREAKING NEWS</div>
            )}
            <div className={`${style.headlineFont} ${style.textColor} font-black tracking-tight`}
              style={{ fontSize: eraStyle === 'classic' ? '2rem' : '1.75rem', lineHeight: 1.1 }}>
              {newspaper.paperName}
            </div>
            <div className={`text-xs ${style.mutedColor} mt-1 tracking-wide`}>
              {newspaper.paperTagline}
            </div>
            <div className={`flex justify-between items-center mt-2 pt-2 border-t ${style.borderColor} text-xs ${style.mutedColor}`}>
              <span>{newspaper.date}</span>
              <span>Edition No. {newspaper.edition}</span>
              <span>Price: {newspaper.year < 1960 ? '5¢' : newspaper.year < 2000 ? '$1.50' : 'Digital'}</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className={`text-center mb-4`}>
            <h1 className={`${style.headlineFont} ${style.textColor} font-black leading-none mb-2`}
              style={{ fontSize: eraStyle === 'digital' ? '1.75rem' : '2rem' }}>
              {newspaper.headline}
            </h1>
            <div className={`${style.headlineFont} ${style.accentColor} text-sm italic`}>
              {newspaper.subheadline}
            </div>
          </div>

          {/* Decorative rule */}
          {eraStyle === 'classic' ? (
            <div className={`flex items-center gap-2 mb-4 ${style.mutedColor}`}>
              <div className={`flex-1 border-t ${style.borderColor}`}></div>
              <span className="text-xs">✦</span>
              <div className={`flex-1 border-t ${style.borderColor}`}></div>
            </div>
          ) : (
            <div className={`border-t ${style.borderColor} mb-4`}></div>
          )}

          {/* Body text in columns */}
          <div className={`${style.textColor} text-sm leading-relaxed mb-6`}
            style={{
              columnCount: eraStyle === 'digital' ? 1 : 2,
              columnGap: '1.5rem',
              columnRule: eraStyle !== 'digital' ? `1px solid ${eraStyle === 'classic' ? '#92400e' : '#d1d5db'}` : 'none',
              fontFamily: eraStyle === 'digital' ? 'inherit' : 'Georgia, "Times New Roman", serif',
            }}>
            <span className={`font-bold ${style.accentColor}`} style={{ fontSize: eraStyle === 'classic' ? '2em' : '1.5em', float: 'left', lineHeight: 0.8, marginRight: '0.1em' }}>
              {newspaper.body?.charAt(0)}
            </span>
            {newspaper.body?.slice(1)}
          </div>

          {/* Secondary story sidebar */}
          {newspaper.secondary && (
            <div className={`border-t ${style.borderColor} pt-3 mt-3`}>
              <div className={`${style.headlineFont} ${style.accentColor} font-bold text-sm mb-1`}>
                ALSO IN THIS EDITION
              </div>
              <div className={`${style.textColor} text-xs`} style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {newspaper.secondary}
              </div>
            </div>
          )}

          {/* Footer with dismiss buttons */}
          <div className={`border-t-2 ${style.borderColor} mt-4 pt-3 flex justify-between items-center`}>
            <div className={`text-xs ${style.mutedColor}`}>
              {queueLength > 0 ? `${queueLength} more headline${queueLength > 1 ? 's' : ''} waiting...` : 'End of headlines'}
            </div>
            <div className="flex gap-2">
              {queueLength > 0 && (
                <button onClick={onSkipAll}
                  className="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition">
                  Skip All ({queueLength + 1})
                </button>
              )}
              <button onClick={onDismiss}
                className="px-4 py-1.5 text-sm bg-amber-800 hover:bg-amber-700 text-white rounded font-bold transition">
                {queueLength > 0 ? 'Next Story →' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes newspaperSlideIn {
          0% { transform: translateY(-40px) scale(0.95); opacity: 0; }
          60% { transform: translateY(5px) scale(1.01); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function NewspaperArchive({ archive, onClose }) {
  if (!archive || archive.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-lg mb-2">No headlines yet</div>
        <div className="text-gray-500 text-sm">Major events will be recorded here as they happen.</div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-white font-bold text-lg">Newspaper Archive ({archive.length})</div>
      </div>
      <div className="grid gap-2 max-h-96 overflow-y-auto pr-1">
        {archive.slice().reverse().map((paper, idx) => (
          <div key={paper.id || idx} className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-amber-600 transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-amber-400 font-bold text-sm" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  {paper.headline}
                </div>
                <div className="text-gray-400 text-xs mt-0.5 italic">{paper.subheadline}</div>
              </div>
              <div className="text-gray-500 text-xs ml-3 whitespace-nowrap">
                {paper.date} · #{paper.edition}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== STUDIO LOT VISUAL ====================
function StudioLotVisual({ state }) {
  const unlocked = getUnlockedBuildings(state);
  const unlockedIds = new Set(unlocked.map(b => b.id));
  const bonuses = getLotPassiveBonuses(state);
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-white font-bold text-lg">Studio Lot</div>
        <div className="text-gray-400 text-xs">{unlocked.length}/{STUDIO_LOT_BUILDINGS.length} buildings</div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => {
            const building = STUDIO_LOT_BUILDINGS.find(b => b.gridPos[0] === col && b.gridPos[1] === row);
            const isUnlocked = building && unlockedIds.has(building.id);
            const isLocked = building && !isUnlocked;
            return (
              <div key={`${col}-${row}`}
                className={`rounded flex flex-col items-center justify-center p-1.5 text-center transition-all min-h-[70px] ${
                  isUnlocked ? 'bg-amber-900/50 border border-amber-600' :
                  isLocked ? 'bg-gray-700/50 border border-gray-600 border-dashed' :
                  'bg-gray-900/30 border border-gray-800'
                }`}
                title={building ? `${building.name}: ${building.desc}\n${isUnlocked ? 'ACTIVE: ' + building.bonus : 'Locked'}` : ''}>
                {building ? (
                  <>
                    <span className={`text-xl ${isUnlocked ? '' : 'opacity-30 grayscale'}`}>{building.emoji}</span>
                    <span className={`text-xs leading-tight mt-0.5 ${isUnlocked ? 'text-amber-300' : 'text-gray-600'}`} style={{ fontSize: '0.65rem' }}>
                      {building.name.length > 14 ? building.name.slice(0, 13) + '…' : building.name}
                    </span>
                    {isLocked && (
                      <span className="text-gray-500 mt-0.5" style={{ fontSize: '0.55rem' }}>
                        {building.unlock.type === 'films' ? `${building.unlock.count} films` :
                         building.unlock.type === 'revenue' ? `${(building.unlock.amount / 1e6).toFixed(0)}M rev` :
                         building.unlock.type === 'rep' ? `${building.unlock.amount} rep` :
                         building.unlock.type === 'awards' ? `${building.unlock.count} awards` :
                         building.unlock.type === 'acquisitions' ? `${building.unlock.count} acq` : ''}
                      </span>
                    )}
                  </>
                ) : null}
              </div>
            );
          })
        ).flat()}
      </div>
      {bonuses.totalQuality > 0 && (
        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2 space-y-0.5">
          <div>Lot Bonus: <span className="text-green-400">+{bonuses.totalQuality} quality</span>
            {bonuses.costReduction > 0 && <span className="text-blue-400 ml-2">-{Math.round(bonuses.costReduction * 100)}% costs</span>}
          </div>
          {Object.keys(bonuses.genreBonuses).length > 0 && (
            <div className="text-gray-500">Genre: {Object.entries(bonuses.genreBonuses).map(([g, v]) => `${g} +${v}`).join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== ANIMATED NUMBER ====================
function AnimatedNumber({ value, format, duration = 800, className = '' }) {
  const [display, setDisplay] = React.useState(value);
  const prevRef = React.useRef(value);
  const frameRef = React.useRef(null);
  const startRef = React.useRef(null);
  const [flash, setFlash] = React.useState(null);

  React.useEffect(() => {
    const prev = prevRef.current;
    const diff = value - prev;
    if (Math.abs(diff) < 1) { setDisplay(value); prevRef.current = value; return; }
    setFlash(diff > 0 ? 'up' : 'down');
    startRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(prev + diff * eased));
      if (progress < 1) { frameRef.current = requestAnimationFrame(animate); }
      else { setDisplay(value); prevRef.current = value; setTimeout(() => setFlash(null), 300); }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  const formatted = format ? format(display) : display.toLocaleString();
  return <span className={`${className} ${flash === 'up' ? 'anim-flash-green' : flash === 'down' ? 'anim-flash-red' : ''} transition-colors duration-300`}>{formatted}</span>;
}

// ==================== WALK OF FAME ====================
function WalkOfFame({ stars }) {
  if (!stars || stars.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
        <div className="text-gray-500 text-sm">No stars on the Walk of Fame yet.</div>
        <div className="text-gray-600 text-xs mt-1">Talent who reach Legendary status will be inducted.</div>
      </div>
    );
  }
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="text-amber-400 font-bold text-lg mb-3">⭐ Walk of Fame</div>
      <div className="flex flex-wrap gap-2">
        {stars.map((star, i) => (
          <div key={star.name + i} className="relative group">
            <div className="w-24 h-24 rounded-sm flex flex-col items-center justify-center text-center p-1"
              style={{ background: 'linear-gradient(135deg, #d4956b 0%, #c4815a 50%, #d4956b 100%)', border: '2px solid #b8860b', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3)' }}>
              <div className="text-amber-300 text-2xl leading-none" style={{ textShadow: '0 0 4px rgba(255,215,0,0.5)' }}>★</div>
              <div className="text-white text-xs font-bold leading-tight mt-0.5" style={{ fontSize: '0.6rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {star.name.length > 16 ? star.name.slice(0, 15) + '…' : star.name}
              </div>
              <div className="text-amber-200 mt-0.5" style={{ fontSize: '0.5rem' }}>
                {star.type === 'actor' ? '🎭' : star.type === 'director' ? '🎬' : star.type === 'writer' ? '✍️' : '🎵'} {star.yearInducted}
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
              {star.name} · {star.achievement}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== BIDDING WAR MODAL ====================
function BiddingWarModal({ bidding, cash, onRaise, onWalk, onClose }) {
  if (!bidding) return null;
  const isActive = bidding.status === 'active';
  const allBids = [{ name: 'You', bid: bidding.playerBid, isPlayer: true, folded: false },
    ...bidding.rivals.map(r => ({ ...r, isPlayer: false }))].sort((a, b) => b.bid - a.bid);
  const raises = [
    { label: '+10%', amount: Math.round(bidding.playerBid * 0.10) },
    { label: '+25%', amount: Math.round(bidding.playerBid * 0.25) },
    { label: '+50%', amount: Math.round(bidding.playerBid * 0.50) },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="bg-gray-900 border-2 border-amber-600 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" style={{ animation: 'newspaperSlideIn 0.4s ease-out' }}>
        <div className="text-center mb-4">
          <div className="text-amber-400 font-bold text-xs tracking-widest mb-1">BIDDING WAR</div>
          <div className="text-white font-bold text-xl">{bidding.target.name}</div>
          <div className="text-gray-400 text-sm">Round {bidding.round} of {bidding.maxRounds}</div>
        </div>
        <div className="space-y-1.5 mb-4">
          {allBids.map((b, i) => (
            <div key={b.name} className={`flex justify-between items-center px-3 py-2 rounded ${
              b.folded ? 'bg-gray-800/50 opacity-40' : b.isPlayer ? 'bg-amber-900/30 border border-amber-700' :
              i === 0 ? 'bg-red-900/30 border border-red-700' : 'bg-gray-800 border border-gray-700'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${b.isPlayer ? 'text-amber-400' : b.folded ? 'text-gray-600 line-through' : 'text-white'}`}>{b.name}</span>
                {b.folded && <span className="text-red-400 text-xs">FOLDED</span>}
                {!b.folded && i === 0 && <span className="text-green-400 text-xs">LEADING</span>}
              </div>
              <span className={`font-bold ${b.isPlayer ? 'text-amber-400' : 'text-white'}`}>{fmt(b.bid)}</span>
            </div>
          ))}
        </div>
        <div className="bg-gray-800 rounded p-3 mb-4 max-h-32 overflow-y-auto">
          {bidding.history.map((h, i) => (
            <div key={i} className={`text-xs ${h.event.includes('SOLD') || h.event.includes('wins') ? 'text-amber-400 font-bold' :
              h.event.includes('folds') ? 'text-red-400' : h.event.includes('SURPRISE') ? 'text-purple-400 font-bold' : 'text-gray-400'}`}>{h.event}</div>
          ))}
        </div>
        {isActive ? (
          <div className="space-y-2">
            <div className="text-gray-400 text-xs text-center mb-1">Your cash: {fmt(cash)}</div>
            <div className="flex gap-2">
              {raises.map(r => (
                <button key={r.label} onClick={() => onRaise(r.amount)} disabled={cash < bidding.playerBid + r.amount}
                  className="flex-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-30 text-white font-bold py-2 rounded text-sm transition">
                  Raise {r.label}<br/><span className="text-xs opacity-70">({fmt(bidding.playerBid + r.amount)})</span>
                </button>
              ))}
            </div>
            <button onClick={onWalk} className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 rounded text-sm transition">Walk Away</button>
          </div>
        ) : (
          <div className="text-center">
            <div className={`text-lg font-bold mb-3 ${bidding.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
              {bidding.status === 'won' ? 'YOU WON!' : 'OUTBID'}
            </div>
            <button onClick={onClose} className="bg-amber-700 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded transition">
              {bidding.status === 'won' ? 'Claim Prize' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== CONFETTI / FIREWORKS ====================
function ConfettiOverlay({ celebration, onDone }) {
  React.useEffect(() => {
    if (celebration) { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }
  }, [celebration, onDone]);
  if (!celebration) return null;
  const isFW = celebration.type === 'fireworks';
  const cols = celebration.color === 'gold' ? ['#FFD700','#FFA500','#FF8C00','#DAA520','#F0E68C','#FFFACD'] : ['#4ade80','#22c55e','#16a34a','#86efac','#a3e635','#fbbf24'];
  const particles = Array.from({length: isFW ? 50 : 35}, (_, i) => ({
    id: i, left: Math.random()*100, delay: Math.random()*0.8, dur: 2+Math.random()*2,
    size: isFW ? 4+Math.random()*6 : 6+Math.random()*8, color: cols[i % cols.length], rot: Math.random()*360, dx: (Math.random()-0.5)*200, dy: (Math.random()-0.5)*200,
  }));
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50" style={{animation:'celebBounce 0.5s ease-out'}}>
        <div className="px-6 py-3 rounded-lg text-2xl font-black text-center"
          style={{background:isFW?'linear-gradient(135deg,#FFD700,#FF8C00)':'linear-gradient(135deg,#4ade80,#22c55e)',color:isFW?'#1a1a2e':'#fff',textShadow:isFW?'0 0 10px rgba(255,215,0,0.5)':'0 1px 2px rgba(0,0,0,0.3)',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
          {celebration.message}
        </div>
      </div>
      {particles.map(p => (
        <div key={p.id} style={{position:'absolute',left:`${p.left}%`,top:isFW?'50%':'-5%',width:`${p.size}px`,height:`${p.size*(isFW?1:0.6)}px`,
          backgroundColor:p.color,borderRadius:isFW?'50%':'2px',transform:`rotate(${p.rot}deg)`,
          animation:`${isFW?'fwBurst':'confFall'} ${p.dur}s ease-${isFW?'out':'in'} ${p.delay}s forwards`,opacity:0}} />
      ))}
      <style>{`
        @keyframes confFall { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) rotate(720deg)} }
        @keyframes fwBurst { 0%{opacity:1;transform:translate(0,0) scale(0.5)} 50%{opacity:1} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0)} }
        @keyframes celebBounce { 0%{transform:translateX(-50%) scale(0.3);opacity:0} 60%{transform:translateX(-50%) scale(1.1);opacity:1} 100%{transform:translateX(-50%) scale(1)} }
      `}</style>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function MovieMogul() {
  const [state, dispatch] = useReducer(reducer, INIT);
  const [tab, setTab] = useState('dashboard');
  const [nameInput, setNameInput] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [specIdx, setSpecIdx] = useState(0);
  const [mottoInput, setMottoInput] = useState('');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [screeningSortBy, setScreeningSortBy] = useState('year');

  // ---- Title Screen ----
  if (state.phase === 'title') {
    const selColor = STUDIO_COLORS[colorIdx];
    const selSpec = SPECIALIZATIONS[specIdx];
    const selScenario = SCENARIOS[scenarioIdx];
    const startGame = () => {
      if (nameInput.trim()) dispatch({ type: 'START_GAME', name: nameInput.trim(), color: colorIdx, specialization: specIdx, motto: mottoInput.trim(), scenario: selScenario.id });
    };
    return (
      <div className="w-full min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-lg w-full">
          <div className={`text-6xl font-bold ${selColor.accent} mb-2`}>MOVIE MOGUL</div>
          <div className="text-xl text-gray-400 mb-8">Build a Hollywood empire from the ground up</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 space-y-5">
            <div>
              <div className="text-gray-300 text-sm mb-2">Name your studio</div>
              <input type="text" placeholder="e.g. Starlight Pictures" value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && nameInput.trim()) startGame(); }}
                className={`w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-center text-lg focus:${selColor.border} outline-none`} />
            </div>
            <div>
              <div className="text-gray-300 text-sm mb-2">Studio motto <span className="text-gray-500">(optional)</span></div>
              <input type="text" placeholder='e.g. "Where dreams become cinema"' value={mottoInput} onChange={e => setMottoInput(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg text-center text-sm focus:border-gray-400 outline-none" />
            </div>
            <div>
              <div className="text-gray-300 text-sm mb-2">Studio color</div>
              <div className="flex gap-2 justify-center">
                {STUDIO_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setColorIdx(i)}
                    className={`w-10 h-10 rounded-full ${c.bg} transition ${colorIdx === i ? 'ring-2 ring-offset-2 ring-offset-gray-800 ' + c.ring : 'opacity-50 hover:opacity-80'}`}
                    title={c.name} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-sm mb-2">Specialization</div>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map((s, i) => (
                  <button key={i} onClick={() => setSpecIdx(i)}
                    className={`text-left p-2.5 rounded-lg border transition text-xs ${specIdx === i ? `${selColor.border} bg-gray-700` : 'border-gray-600 bg-gray-750 hover:border-gray-500'}`}>
                    <div className="text-white font-bold">{s.name}</div>
                    <div className="text-gray-400">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-gray-300 text-sm mb-2">Game Mode</div>
              <div className="grid grid-cols-2 gap-2">
                {SCENARIOS.map((scn, i) => (
                  <button key={i} onClick={() => setScenarioIdx(i)}
                    className={`text-left p-2.5 rounded-lg border transition text-xs ${scenarioIdx === i ? `${selColor.border} bg-gray-700` : 'border-gray-600 bg-gray-750 hover:border-gray-500'}`}>
                    <div className="text-white font-bold">{scn.name}</div>
                    <div className="text-gray-400">{scn.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={startGame} disabled={!nameInput.trim()}
              className={`w-full ${selColor.bg} hover:opacity-90 disabled:opacity-40 text-gray-900 font-bold py-3 rounded-lg text-lg transition`}>
              START GAME
            </button>
          </div>
          <div className="text-gray-600 text-xs mt-6">Start in 1970 with $5M. Build your way to a Hollywood legend.</div>
        </div>
      </div>
    );
  }

  // ---- Legacy / Endgame Screen ----
  if (state.phase === 'legacy') {
    const score = state.legacyScore || calcLegacyScore(state);
    const benchmark = [...LEGACY_BENCHMARKS].reverse().find(b => score >= b.minScore) || LEGACY_BENCHMARKS[0];
    const color = STUDIO_COLORS[state.studioColor] || STUDIO_COLORS[0];
    return (
      <div className="w-full min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className={`text-5xl font-bold ${color.accent}`}>{state.studioName}</div>
          {state.studioMotto && <div className="text-gray-400 text-lg italic">"{state.studioMotto}"</div>}
          <div className="text-gray-400 text-sm">1970 — {state.year} | {state.turn} months of cinema history</div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="text-amber-400 text-3xl font-bold mb-1">{benchmark.name}</div>
            <div className="text-gray-300 mb-4">{benchmark.desc}</div>
            <div className={`text-6xl font-bold ${color.accent} mb-2`}>{score.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Legacy Score</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-green-400 font-bold text-xl">{fmt(state.totalGross)}</div>
              <div className="text-xs text-gray-400">Total Gross</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-amber-400 font-bold text-xl">{state.totalAwards}</div>
              <div className="text-xs text-gray-400">Awards Won</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-blue-400 font-bold text-xl">{state.totalFilmsReleased}</div>
              <div className="text-xs text-gray-400">Films Released</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-purple-400 font-bold text-xl">{state.franchises.length}</div>
              <div className="text-xs text-gray-400">Franchises Built</div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-3">Milestones Achieved</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(state.milestones).map(([key, val]) => (
                <span key={key} className={`px-3 py-1 rounded-full text-xs font-bold ${val ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-500'}`}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-3">Achievements ({state.unlockedAchievements.length}/{ACHIEVEMENTS.length})</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {ACHIEVEMENTS.map(a => (
                <span key={a.id} className={`px-2 py-1 rounded text-xs ${state.unlockedAchievements.includes(a.id) ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
                  {a.name}
                </span>
              ))}
            </div>
          </div>

          {state.annualAwards.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-left">
              <div className="text-white font-bold text-sm mb-3 text-center">Awards History</div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {state.annualAwards.slice().reverse().map((yr, i) => (
                  <div key={yr.year} className="text-xs">
                    <span className={`font-bold ${yr.isNegative ? 'text-red-400' : 'text-amber-400'}`}>{yr.showIcon || '🏆'} {yr.year} {yr.showName || 'Awards'}:</span>
                    {yr.awards.slice(0, 3).map((a, j) => <span key={j} className={`ml-1 ${a.isRivalWin ? 'text-gray-600' : 'text-gray-300'}`}>{a.isRivalWin ? '' : '🏆'} {a.category}</span>)}
                    {yr.awards.length > 3 && <span className="text-gray-500 ml-1">+{yr.awards.length - 3} more</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-2">How do you compare?</div>
            <div className="space-y-1">
              {LEGACY_BENCHMARKS.map((b, i) => (
                <div key={i} className={`flex justify-between text-xs px-2 py-1 rounded ${score >= b.minScore ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>
                  <span className="font-bold">{b.name}</span>
                  <span>{b.minScore.toLocaleString()}+ pts</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => window.location.reload()}
            className={`${color.bg} hover:opacity-90 text-gray-900 font-bold px-8 py-3 rounded-lg text-lg transition`}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // ---- Game UI ----
  const era = getEra(state.year);
  const studioColor = STUDIO_COLORS[state.studioColor] || STUDIO_COLORS[0];
  const prestigeTier = [...PRESTIGE_TIERS].reverse().find(t => state.prestige >= t.minScore / 100) || PRESTIGE_TIERS[0];
  const currentLegacy = calcLegacyScore(state);
  const legacyBench = [...LEGACY_BENCHMARKS].reverse().find(b => currentLegacy >= b.minScore) || LEGACY_BENCHMARKS[0];
  const inPipeline = state.films.filter(f => ['development', 'production', 'postproduction', 'script_dev', 'pre_production', 'principal_photography', 'post_production', 'marketing_campaign'].includes(f.status));
  const released = state.films.filter(f => f.status === 'released').slice().reverse();
  const awaitingRelease = state.films.filter(f => f.status === 'completed' || f.status === 'scheduled');
  const tabs = ['dashboard', 'develop', 'production', 'release', 'talent', 'studio', 'finance', 'market', 'streaming', 'catalog', 'press', 'academy', 'partners', 'screening'];
  const tabIcons = { dashboard: '📊', develop: '🎬', production: '🎥', release: '🎞', talent: '⭐', studio: '🏢', finance: '💰', market: '📈', streaming: '📺', catalog: '📀', press: '📰', academy: '🎓', partners: '🌍', screening: '🎬' };

  const facilityCosts = [0, 500000, 2000000, 5000000, 15000000, 50000000];
  const facilityNames = ['Garage Studio', 'Small Lot', 'Soundstages', 'VFX Lab', 'Backlot Complex', 'Premier Facilities'];

  // ---- Tab Content ----
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-xs">Cash</div>
          <div className={`text-xl font-bold ${state.cash >= 0 ? 'text-green-400' : 'text-red-400'}`}><AnimatedNumber value={state.cash} format={fmt} /></div>
        </div>
        <StatBar label="Reputation" value={state.reputation} max={100} color="bg-red-500" />
        <StatBar label="Prestige" value={state.prestige} max={100} color="bg-purple-500" />
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-xs">Era</div>
          <div className="text-amber-400 font-bold text-sm mt-1">{era}</div>
          <div className="text-gray-400 text-xs mt-1">Turn {state.turn} | Films: {state.films.length}</div>
        </div>
      </div>

      {/* Quick info row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {state.isPublic && (
          <div className="bg-gray-800 border border-green-700 rounded-lg p-2 text-center">
            <div className="text-gray-400 text-xs">Stock</div>
            <div className="text-green-400 font-bold">${state.stockPrice}</div>
          </div>
        )}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">Tech</div>
          <div className="text-teal-400 font-bold text-sm">{state.unlockedTech.length}/{TECH_TREE.filter(t => t.year <= state.year).length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">Movements</div>
          <div className="text-purple-400 font-bold text-sm">{getActiveMovements(state.year).length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">TV Shows</div>
          <div className="text-teal-400 font-bold text-sm">{state.tvShows.filter(s => s.status === 'airing').length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">Parks</div>
          <div className="text-green-400 font-bold text-sm">{state.themeParks.filter(p => p.operational).length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-center">
          <div className="text-gray-400 text-xs">Academy</div>
          <div className="text-amber-400 font-bold text-sm">{state.academy.length}</div>
        </div>
      </div>

      {state.cashHistory.length > 1 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-3">Cash History</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={state.cashHistory.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={(d) => MONTH_NAMES[(d.month || 1) - 1]} stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : `${(v/1e6).toFixed(0)}M`} />
              <Tooltip formatter={v => fmt(v)} labelFormatter={(_, payload) => payload[0] ? `${MONTH_FULL[(payload[0].payload.month || 1) - 1]} ${payload[0].payload.year}` : ''} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', fontSize: 12 }} />
              <Area type="monotone" dataKey="cash" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {awaitingRelease.length > 0 && (
        <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
          <div className="text-green-400 font-bold text-sm mb-1">Films Ready for Release ({awaitingRelease.length})</div>
          <div className="text-gray-300 text-xs mb-2">Head to the Release tab to schedule release windows.</div>
          <div className="flex gap-2 flex-wrap">
            {awaitingRelease.map(f => (
              <span key={f.id} className={`text-xs px-2 py-1 rounded ${f.status === 'completed' ? 'bg-green-700 text-green-200' : 'bg-teal-700 text-teal-200'}`}>
                {f.title} ({f.status === 'scheduled' ? `${MONTH_NAMES[(f.scheduledMonth || 1) - 1]} ${f.scheduledYear}` : 'unscheduled'})
              </span>
            ))}
          </div>
        </div>
      )}

      {inPipeline.length > 0 && (
        <div>
          <div className="text-white font-bold text-sm mb-2">Films in Pipeline ({inPipeline.length})</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inPipeline.map(f => <FilmCard key={f.id} film={f} />)}
          </div>
        </div>
      )}

      <div>
        <div className="text-white font-bold text-sm mb-2">Milestones</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            ['indieDarling', 'Indie Darling', '3+ awards'],
            ['boxOfficeKing', 'Box Office King', '$1B gross'],
            ['franchiseBuilder', 'Franchise Builder', '3+ film franchise'],
            ['studioMogul', 'Studio Mogul', '$500M + Lv5 facilities'],
            ['streamingPioneer', 'Streaming Pioneer', '10M subscribers'],
            ['hollywoodLegend', 'Hollywood Legend', 'All milestones'],
          ].map(([key, name, desc]) => (
            <div key={key} className={`rounded-lg p-3 border text-sm ${state.milestones[key] ? 'bg-amber-500 border-amber-400 text-gray-900' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
              <div className="font-bold">{state.milestones[key] ? '✓ ' : ''}{name}</div>
              <div className="text-xs opacity-70">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {Object.keys(state.genreFanbase || {}).length > 0 && (
        <div>
          <div className="text-white font-bold text-sm mb-2">Your Genre Fanbase</div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
            {Object.entries(state.genreFanbase || {}).filter(([,v]) => v.films > 0).sort((a,b) => b[1].loyalty - a[1].loyalty).map(([genre, data]) => (
              <div key={genre} className="bg-gray-800 border border-gray-700 rounded p-2 text-center">
                <div className="text-amber-400 text-xs font-bold">{genre}</div>
                <div className="text-white text-sm font-bold">{data.loyalty}%</div>
                <div className="text-xs text-gray-500">{data.films} films</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURE 7: STUDIO GENRE IDENTITY */}
      {Object.keys(state.genreIdentity || {}).length > 0 && (
        <div>
          <div className="text-white font-bold text-sm mb-2">Studio Genre Identity</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(state.genreIdentity || {}).sort((a, b) => b[1].films - a[1].films).slice(0, 8).map(([genre, data]) => (
              <div key={genre} className={`text-xs px-3 py-1.5 rounded-full border ${data.reputation >= 70 ? 'border-amber-500 text-amber-400 bg-amber-900/20' : data.reputation >= 40 ? 'border-gray-500 text-gray-300 bg-gray-800/40' : 'border-gray-700 text-gray-500 bg-gray-900/40'}`}>
                {genre} ({data.films} {data.films === 1 ? 'film' : 'films'}, {data.reputation} rep)
              </div>
            ))}
          </div>
        </div>
      )}

      {state.scenarioGoal && !state.scenarioWon && state.scenario !== 'sandbox' && (
        <div className={`rounded-lg p-4 border ${state.scenarioWon ? 'bg-amber-500 border-amber-400 text-gray-900' : 'bg-blue-900 border-blue-600 text-white'}`}>
          <div className="text-sm font-bold mb-2">Scenario Goal: {state.scenarioGoal.type === 'cash' ? `$${(state.scenarioGoal.target/1e6).toFixed(0)}M Cash` : state.scenarioGoal.type === 'awards' ? `${state.scenarioGoal.target} Awards` : state.scenarioGoal.type === 'franchises' ? `${state.scenarioGoal.target} Franchises` : 'All Genres Profitable'}</div>
          <div className="text-xs mb-2">Deadline: Year {state.scenarioDeadline} ({state.scenarioDeadline - state.year} years left)</div>
          {state.scenarioGoal.type === 'cash' && (
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Progress: {fmt(state.cash)} / {fmt(state.scenarioGoal.target)}</span>
              <span className="text-xs">{Math.round((state.cash / state.scenarioGoal.target) * 100)}%</span>
            </div>
          )}
          {state.scenarioGoal.type === 'awards' && (
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Progress: {state.totalAwards} / {state.scenarioGoal.target} awards</span>
              <span className="text-xs">{Math.round((state.totalAwards / state.scenarioGoal.target) * 100)}%</span>
            </div>
          )}
          {state.scenarioGoal.type === 'franchises' && (
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Progress: {state.franchises.length} / {state.scenarioGoal.target} franchises</span>
              <span className="text-xs">{Math.round((state.franchises.length / state.scenarioGoal.target) * 100)}%</span>
            </div>
          )}
          <div className="w-full bg-gray-700/50 rounded-full h-2 mt-1">
            <div className={`h-2 rounded-full transition-all ${state.scenarioGoal.type === 'cash' ? 'bg-green-400' : state.scenarioGoal.type === 'awards' ? 'bg-amber-400' : 'bg-blue-400'}`} style={{ width: `${state.scenarioGoal.type === 'cash' ? Math.min((state.cash / state.scenarioGoal.target) * 100, 100) : state.scenarioGoal.type === 'awards' ? Math.min((state.totalAwards / state.scenarioGoal.target) * 100, 100) : Math.min((state.franchises.length / state.scenarioGoal.target) * 100, 100)}%` }}></div>
          </div>
        </div>
      )}

      {state.scenarioWon && (
        <div className="bg-amber-500 border-2 border-amber-400 rounded-lg p-4 text-center text-gray-900 font-bold text-lg">
          VICTORY! Scenario Complete!
        </div>
      )}

      {state.boxOfficeChart.length > 0 && (
        <div>
          <div className="text-white font-bold text-sm mb-2">Box Office Chart — {MONTH_FULL[(state.month || 1) - 1]} {state.year}</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-1.5">
            {state.boxOfficeChart.map((entry, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${i === 0 ? 'text-amber-400' : i < 3 ? 'text-gray-300' : 'text-gray-500'}`}>#{i + 1}</span>
                  <span className={`${entry.studio === state.studioName ? studioColor.accent + ' font-bold' : 'text-white'}`}>{entry.title}</span>
                  <span className="text-gray-500">({entry.studio})</span>
                </div>
                <span className="text-green-400 font-bold">{fmt(entry.gross)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.annualAwards.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-white font-bold text-sm">Recent Awards</div>
            {state.pendingCeremony && (
              <button onClick={() => dispatch({ type: 'SET_DEV', key: 'showCeremony', value: true })}
                className="text-amber-400 text-xs hover:text-amber-300 transition">
                View Full Ceremony →
              </button>
            )}
          </div>
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-4 max-h-48 overflow-y-auto">
            {state.annualAwards.slice(-6).reverse().map((yr, i) => (
              <div key={yr.year} className="mb-2 last:mb-0">
                <div className={`font-bold text-xs mb-1 ${yr.isNegative ? 'text-red-400' : 'text-amber-400'}`}>{yr.showIcon || '🏆'} {yr.year} {yr.showName || 'Awards'}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                  {yr.awards.slice(0, 4).map((a, j) => (
                    <div key={j} className={`text-xs ${a.isRivalWin ? 'text-gray-600' : 'text-gray-300'}`}>
                      {a.isRivalWin ? '' : (yr.isNegative ? '💩' : '🏆')} <span className="font-bold">{a.category}</span>: "{a.film}"
                    </div>
                  ))}
                  {yr.awards.length > 4 && <div className="text-xs text-gray-500">+{yr.awards.length - 4} more</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-white font-bold text-sm">Event Feed</div>
          <div className="flex gap-1 flex-wrap">
            {[['all','All'],['boxoffice','Box Office'],['production','Prod'],['talent','Talent'],['market','Market'],['streaming','Stream'],['rivals','Rivals']].map(([f, label]) => (
              <button key={f} onClick={() => dispatch({ type: 'SET_LOG_FILTER', filter: f })}
                className={`px-2 py-0.5 rounded text-xs font-bold transition ${(state.logFilter || 'all') === f ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 max-h-52 overflow-y-auto space-y-0.5">
          {state.gameLog.slice().reverse()
            .filter(entry => (state.logFilter || 'all') === 'all' || (entry.category || 'general') === (state.logFilter || 'all'))
            .slice(0, 25)
            .map((entry, i) => {
              const typeColors = { info: 'text-blue-400', success: 'text-green-400', warning: 'text-red-400', award: 'text-amber-400', error: 'text-red-500', dialogue: 'text-cyan-300' };
              const dots = { warning: '🔴', error: '🔴', success: '🟢', award: '🟡', dialogue: '💬', info: '' };
              return (
                <div key={i} className={`text-xs ${typeColors[entry.type] || 'text-gray-400'} flex items-start gap-1`}>
                  {dots[entry.type] && <span className="flex-shrink-0">{dots[entry.type]}</span>}
                  <span>{entry.text}</span>
                </div>
              );
            })}
          {state.gameLog.filter(entry => (state.logFilter || 'all') === 'all' || (entry.category || 'general') === (state.logFilter || 'all')).length === 0 && (
            <div className="text-gray-600 text-xs text-center py-2">No events in this category yet.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDevelop = () => {
    if (state.devScriptIdx < 0) {
      if (state.devMode === 'screenplay') {
        const csWriter = state.contracts.find(t => t.id === state.customScriptWriterId);
        const writingCost = csWriter ? Math.round(csWriter.salary * 0.5) : 0;
        return (
          <div className="max-w-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-white font-bold text-lg">Commission an Original Screenplay</div>
              <button onClick={() => dispatch({ type: 'SET_DEV_MODE', mode: 'browse' })} className="text-gray-400 hover:text-white text-sm">← Back</button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-white font-bold text-sm mb-2">Genre <span className="text-red-400">*</span></div>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map(g => (
                  <button key={g} onClick={() => dispatch({ type: 'SET_SCREENPLAY_FIELD', key: 'customScriptGenre', value: g })}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${state.customScriptGenre === g ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-white font-bold text-sm mb-2">Secondary Genre <span className="text-gray-500 font-normal">(optional)</span></div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => dispatch({ type: 'SET_SCREENPLAY_FIELD', key: 'customScriptGenre2', value: null })}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition ${!state.customScriptGenre2 ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  None
                </button>
                {GENRES.filter(g => g !== state.customScriptGenre).map(g => (
                  <button key={g} onClick={() => dispatch({ type: 'SET_CUSTOM_SCRIPT', key: 'customScriptGenre2', value: g })}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${state.customScriptGenre2 === g ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
              <div>
                <div className="text-white font-bold text-sm mb-1">Title <span className="text-red-400">*</span></div>
                <input type="text" value={state.customScriptTitle} maxLength={60}
                  onChange={e => dispatch({ type: 'SET_SCREENPLAY_FIELD', key: 'customScriptTitle', value: e.target.value })}
                  placeholder="Enter your film's title..."
                  className="w-full bg-gray-700 text-white text-sm rounded p-2 border border-gray-600 focus:border-amber-400 outline-none" />
              </div>
              <div>
                <div className="text-white font-bold text-sm mb-1">Logline <span className="text-red-400">*</span></div>
                <textarea value={state.customScriptLogline} maxLength={200} rows={3}
                  onChange={e => dispatch({ type: 'SET_SCREENPLAY_FIELD', key: 'customScriptLogline', value: e.target.value })}
                  placeholder="A one-sentence summary of your film's story..."
                  className="w-full bg-gray-700 text-white text-sm rounded p-2 border border-gray-600 focus:border-amber-400 outline-none resize-none" />
                <div className="text-xs text-gray-500 text-right">{state.customScriptLogline.length}/200</div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-white font-bold text-sm mb-2">Assign Writer <span className="text-red-400">*</span></div>
              <div className="space-y-1.5">
                {state.contracts.filter(t => t.type === 'writer').map(w => {
                  const isSelected = state.customScriptWriterId === w.id;
                  const genreMatch = w.genreBonus === state.customScriptGenre;
                  return (
                    <button key={w.id} onClick={() => dispatch({ type: 'SET_SCREENPLAY_FIELD', key: 'customScriptWriterId', value: w.id })}
                      className={`w-full text-left p-2 rounded text-sm transition border ${isSelected ? 'bg-amber-700 border-amber-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                      <div className="flex justify-between">
                        <span className="font-bold">{w.name}</span>
                        <span className="text-xs">Skill: {w.skill} | Cost: {fmt(Math.round(w.salary * 0.5))}</span>
                      </div>
                      <div className="text-xs mt-0.5">
                        {w.trait && <span className="text-purple-300">{w.trait}</span>}
                        {genreMatch && <span className="text-green-400 ml-2">★ {state.customScriptGenre} specialist</span>}
                      </div>
                    </button>
                  );
                })}
                {state.contracts.filter(t => t.type === 'writer').length === 0 && (
                  <div className="text-gray-500 text-sm">No writers under contract. Sign a writer in the Talent tab first.</div>
                )}
              </div>
            </div>

            {(state.pendingScreenplays || []).length > 0 && (
              <div className="bg-gray-800 border border-blue-600 rounded-lg p-3">
                <div className="text-blue-400 font-bold text-xs mb-1">Screenplays In Progress</div>
                {(state.pendingScreenplays || []).map((s, i) => (
                  <div key={i} className="text-xs text-gray-300">"{s.title}" ({s.genre}) by {s.writerName} — {s.turnsLeft} month(s) left</div>
                ))}
              </div>
            )}

            {csWriter && (
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                <div className="text-xs text-gray-400">Estimated market fit: <span className="text-white font-bold">{clamp(30 + Math.round(csWriter.skill * 0.4) + (csWriter.genreBonus === state.customScriptGenre ? 15 : 0), 20, 98)}%</span> (±10% variance)</div>
                <div className="text-xs text-gray-400 mt-1">Writing cost: <span className="text-green-400 font-bold">{fmt(writingCost)}</span> | Delivery: next month</div>
              </div>
            )}

            <button onClick={() => dispatch({ type: 'COMMISSION_SCREENPLAY' })}
              disabled={!state.customScriptGenre || !(state.customScriptTitle || '').trim() || !(state.customScriptLogline || '').trim() || !state.customScriptWriterId}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-lg transition text-sm">
              Commission Screenplay ({csWriter ? fmt(writingCost) : '—'})
            </button>
          </div>
        );
      }

      return (
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="text-white font-bold text-lg">Available Scripts</div>
            <button onClick={() => dispatch({ type: 'SET_DEV_MODE', mode: 'screenplay' })}
              className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded transition">
              + Write Original Script
            </button>
          </div>
          <div className="text-gray-400 text-sm mb-4">Choose a script to develop, or write your own.</div>
          {(state.pendingScreenplays || []).length > 0 && (
            <div className="bg-gray-800 border border-blue-600 rounded-lg p-3 mb-4">
              <div className="text-blue-400 font-bold text-xs mb-1">Screenplays Being Written</div>
              {(state.pendingScreenplays || []).map((s, i) => (
                <div key={i} className="text-xs text-gray-300">"{s.title}" ({s.genre}) by {s.writerName} — {s.turnsLeft} month(s) until delivery</div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.scripts.map((s, i) => (
              <div key={i} onClick={() => !s.isHot ? dispatch({ type: 'SELECT_SCRIPT', idx: i }) : null}
                className={`bg-gray-800 border ${s.isHot ? 'border-red-500' : s.isOriginal || s.isIP ? 'border-amber-500' : 'border-gray-700'} hover:border-amber-400 rounded-lg p-5 ${s.isHot ? '' : 'cursor-pointer'} transition`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-amber-400 text-xs font-bold uppercase">{s.genre}</span>
                    {s.genre2 && <span className="text-purple-400 text-xs font-bold uppercase ml-1">/ {s.genre2}</span>}
                    {s.isOriginal && <span className="text-amber-300 text-xs ml-2">(Original)</span>}
                    {s.isIP && <span className="text-cyan-400 text-xs ml-2">(IP: {IP_CATEGORIES[s.ipCategory]?.name || 'Adaptation'})</span>}
                  </div>
                  <div className="text-xs text-gray-400">Market Fit: {s.marketFit}%</div>
                </div>
                <div className="text-white font-bold text-lg mb-2">{s.title}</div>
                <div className="text-gray-300 text-sm mb-3">{s.logline}</div>
                <div className="text-xs text-gray-500">Budget range: ${s.budgetMin}M — ${s.budgetMax}M</div>
                {s.isHot && (
                  <div className="mt-2 border-t border-red-800 pt-2">
                    <div className="text-red-400 text-xs font-bold mb-1">🔥 Bidding War! {s.rivalBidder} wants this script.</div>
                    <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'BID_SCRIPT', idx: i, amount: s.bidPrice }); }}
                      className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded font-bold transition">
                      Bid {fmt(s.bidPrice)} to Secure
                    </button>
                    <div className="text-xs text-gray-500 mt-1">Win chance depends on bid amount and your reputation.</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const script = state.scripts[state.devScriptIdx];
    const dir = state.contracts.find(t => t.id === state.devDirectorId);
    const act = state.contracts.find(t => t.id === state.devActorId);
    const wri = state.contracts.find(t => t.id === state.devWriterId);
    const prod = state.contracts.find(t => t.id === state.devProducerId);
    const totalCost = (state.devBudgetM + state.devMarketingM) * 1e6;
    const canAfford = state.cash >= totalCost;
    const hasTeam = dir && act && wri;

    let projectedQuality = null;
    if (hasTeam) {
      const fakeFilm = { _preview: true, director: dir, actor: act, writer: wri, producer: prod || null, budget: state.devBudgetM * 1e6, genre: script.genre, genre2: state.devGenre2 };
      projectedQuality = calcQuality(fakeFilm, state.facilitiesLevel, state.genreTrends[script.genre] || 0, state.specialization);
    }

    return (
      <div className="max-w-2xl space-y-4">
        <div className="bg-gray-800 border border-amber-400 rounded-lg p-5">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase">{script.genre}</span>
            {state.devGenre2 && <span className="text-purple-400 text-xs font-bold uppercase ml-1">/ {state.devGenre2}</span>}
          </div>
          <div className="text-white font-bold text-2xl mt-1">{script.title}</div>
          <div className="text-gray-300 text-sm mt-2">{script.logline}</div>
        </div>

        {/* FILM TYPE SELECTOR */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-2">Film Type</div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'original', label: 'Original', desc: 'A brand new story', icon: '✨' },
              { id: 'sequel', label: 'Sequel', desc: 'Continue a franchise', icon: '2️⃣', needs: state.franchises.length > 0 },
              { id: 'reboot', label: 'Reboot', desc: 'Reimagine a franchise', icon: '🔄', needs: state.franchises.length > 0 },
              { id: 'adaptation', label: 'Adaptation', desc: 'Adapt existing IP', icon: '📚' },
            ].map(ft => (
              <button key={ft.id}
                onClick={() => dispatch({ type: 'SET_DEV', key: 'devFilmType', value: ft.id })}
                disabled={ft.needs === false}
                className={`flex-1 min-w-[100px] p-2 rounded-lg border text-center transition ${
                  state.devFilmType === ft.id
                    ? 'bg-amber-700 border-amber-400 text-white'
                    : ft.needs === false
                      ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}>
                <div className="text-lg">{ft.icon}</div>
                <div className="text-xs font-bold">{ft.label}</div>
                <div className="text-xs text-gray-500">{ft.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FRANCHISE PICKER (for sequels and reboots) */}
        {(state.devFilmType === 'sequel' || state.devFilmType === 'reboot') && (
          <div className="bg-gray-800 border border-purple-600 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-2">
              {state.devFilmType === 'sequel' ? 'Select Franchise for Sequel' : 'Select Franchise to Reboot'}
            </div>
            {state.franchises.length === 0 ? (
              <div className="text-gray-500 text-sm">No franchises yet. Release a film that grosses $100M+ and create a franchise from the Release tab.</div>
            ) : (
              <div className="space-y-2">
                {state.franchises.map(fr => {
                  const isSelected = state.devFranchiseId === fr.id;
                  const filmCount = fr.filmIds.length;
                  const franchiseFilms = state.films.filter(f => fr.filmIds.includes(f.id));
                  return (
                    <button key={fr.id}
                      onClick={() => dispatch({ type: 'SET_DEV', key: 'devFranchiseId', value: fr.id })}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        isSelected ? 'bg-purple-800 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-sm">{fr.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {filmCount} film{filmCount !== 1 ? 's' : ''} · Total gross: {fmt(fr.totalGross || 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          {state.devFilmType === 'sequel' && (
                            <div className="text-xs text-amber-400">This would be #{filmCount + 1}</div>
                          )}
                          {state.devFilmType === 'reboot' && (
                            <div className="text-xs text-blue-400">Fresh start</div>
                          )}
                        </div>
                      </div>
                      {franchiseFilms.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Films: {franchiseFilms.map(f => `"${f.title}" (Q:${f.quality})`).join(', ')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {state.devFilmType === 'sequel' && state.devFranchiseId && (
              <div className="mt-2 text-xs text-gray-400 bg-gray-900 rounded p-2">
                Sequels get a +10% marketing boost but quality decays slightly with each entry (-3 per sequel). Franchise fatigue kicks in after the 3rd film.
              </div>
            )}
            {state.devFilmType === 'reboot' && state.devFranchiseId && (
              <div className="mt-2 text-xs text-gray-400 bg-gray-900 rounded p-2">
                Reboots get a flat +20% gross bonus from brand recognition but cost 15% more to produce.
              </div>
            )}
          </div>
        )}

        {/* ADAPTATION PICKER */}
        {state.devFilmType === 'adaptation' && (
          <div className="bg-gray-800 border border-blue-600 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-2">Select Source Material</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {ADAPTATIONS.map((adapt, idx) => {
                const isSelected = state.devAdaptation === idx;
                return (
                  <button key={idx}
                    onClick={() => dispatch({ type: 'SET_DEV', key: 'devAdaptation', value: idx })}
                    className={`text-left p-2 rounded-lg border transition ${
                      isSelected ? 'bg-blue-800 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}>
                    <div className="font-bold text-xs">{adapt.name}</div>
                    <div className="text-xs text-gray-400">{adapt.type} · {adapt.genre}</div>
                    <div className="text-xs text-gray-500">IP Cost: {fmt(adapt.cost)} · Audience: +{Math.round(adapt.marketingMult * 100 - 100)}%</div>
                  </button>
                );
              })}
            </div>
            {state.devAdaptation !== null && (
              <div className="mt-2 text-xs text-gray-400 bg-gray-900 rounded p-2">
                Adaptations come with built-in audiences and marketing advantages, but you'll pay an IP licensing fee on top of the production budget.
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-2">Secondary Genre <span className="text-gray-500 font-normal">(optional — adds broader audience appeal)</span></div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => dispatch({ type: 'SET_DEV', key: 'devGenre2', value: null })}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${!state.devGenre2 ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              None
            </button>
            {GENRES.filter(g => g !== script.genre).map(g => (
              <button key={g} onClick={() => dispatch({ type: 'SET_DEV', key: 'devGenre2', value: g })}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${state.devGenre2 === g ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-white font-bold text-sm">Production Budget: {fmt(state.devBudgetM * 1e6)}</div>
            <span className={`text-xs font-bold ${getBudgetTier(state.devBudgetM).color}`}>{getBudgetTier(state.devBudgetM).name}</span>
          </div>
          <input type="range" min={script.budgetMin} max={script.budgetMax} step={script.budgetMax > 100 ? 5 : 1} value={state.devBudgetM}
            onChange={e => dispatch({ type: 'SET_DEV', key: 'devBudgetM', value: parseInt(e.target.value) })}
            className="w-full accent-amber-400" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${script.budgetMin}M</span><span>${script.budgetMax}M</span>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-2">Marketing Budget: {fmt(state.devMarketingM * 1e6)}</div>
          <input type="range" min={0} max={Math.min(state.devBudgetM, getEraMarketingMax(state.year))} step={getEraMarketingMax(state.year) > 50 ? 5 : 1} value={state.devMarketingM}
            onChange={e => dispatch({ type: 'SET_DEV', key: 'devMarketingM', value: parseInt(e.target.value) })}
            className="w-full accent-amber-400" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span><span>{fmt(Math.min(state.devBudgetM, getEraMarketingMax(state.year)) * 1e6)}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Director & Writer */}
          {[['devDirectorId', 'Director', 'director'], ['devWriterId', 'Writer', 'writer'], ['devProducerId', 'Producer', 'producer']].map(([key, label, type]) => (
            <div key={key} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="text-white font-bold text-xs mb-2">{label}</div>
              <select value={state[key] ?? ''} onChange={e => dispatch({ type: 'SET_DEV', key, value: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full bg-gray-700 text-white text-sm rounded p-2 border border-gray-600">
                <option value="">— Select —</option>
                {state.contracts.filter(t => t.type === type).map(t => (
                  <option key={t.id} value={t.id}>{t.name} (Skill:{t.skill}{t.profitParticipation > 0 ? `, ${t.profitParticipation}%` : ''}) {t.demands && t.demands.length > 0 ? `⚠${t.demands.length}` : ''} — {t.trait || 'No trait'}</option>
                ))}
              </select>
              {key === 'devDirectorId' && state.devDirectorId && selectedScript && (() => {
                const d = state.contracts.find(t => t.id === state.devDirectorId);
                if (!d) return null;
                const isExpert = d.genreBonus === selectedScript.genre;
                const isMismatch = d.genreBonus && d.genreBonus !== selectedScript.genre;
                return (isExpert || isMismatch) ? (
                  <div className={`mt-1 text-xs ${isExpert ? 'text-green-400' : 'text-red-400'}`}>
                    {isExpert ? `★ Genre expert in ${selectedScript.genre} (+${DIRECTOR_GENRE_EXPERTISE_BONUS} quality)` : `⚠ Mismatch: ${d.genreBonus} specialist directing ${selectedScript.genre} (${DIRECTOR_GENRE_MISMATCH_PENALTY} quality)`}
                  </div>
                ) : null;
              })()}
            </div>
          ))}
          {/* === EXPANDED CAST SECTION === */}
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-3 col-span-2">
            <div className="text-amber-400 font-bold text-sm mb-3">Cast</div>
            <div className="grid grid-cols-2 gap-3">
              {[['devActorId', 'Lead Actor', 0.50], ['devSupporting1Id', 'Supporting Actor', 0.25], ['devSupporting2Id', 'Supporting Actor 2', 0.15], ['devEnsembleId', 'Ensemble', 0.10]].map(([key, label, spWeight]) => (
                <div key={key} className="bg-gray-900 rounded p-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-600">Star Weight: {Math.round(spWeight * 100)}%</span>
                  </div>
                  <select value={state[key] ?? ''} onChange={e => dispatch({ type: 'SET_DEV', key, value: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full bg-gray-700 text-white text-xs rounded p-1.5 border border-gray-600">
                    <option value="">— {key === 'devActorId' ? 'Required' : 'Optional'} —</option>
                    {state.contracts.filter(t => t.type === 'actor' && t.id !== state.devActorId && t.id !== state.devSupporting1Id && t.id !== state.devSupporting2Id && t.id !== state.devEnsembleId || t.id === state[key]).map(t => {
                      const stage = getCareerStage ? getCareerStage(t) : '';
                      return (
                        <option key={t.id} value={t.id}>{t.name} (Pop:{t.popularity} Skill:{t.skill}) {t.genreBonus === (selectedScript?.genre) ? '★' : ''} — ${Math.round((t.salary || 0) / 1e6)}M</option>
                      );
                    })}
                  </select>
                  {state[key] && (() => {
                    const t = state.contracts.find(c => c.id === state[key]);
                    if (!t) return null;
                    const isGenreMatch = t.genreBonus === selectedScript?.genre;
                    return (
                      <div className="mt-1 flex gap-2 text-xs">
                        <span className={isGenreMatch ? 'text-green-400' : 'text-gray-500'}>{isGenreMatch ? '★ Genre fit' : 'No genre bonus'}</span>
                        <span className="text-blue-400">Pop: {t.popularity}</span>
                        <span className="text-purple-400">Skill: {t.skill}</span>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
            {/* Star Power Rating */}
            {(() => {
              const castIds = [state.devActorId, state.devSupporting1Id, state.devSupporting2Id, state.devEnsembleId].filter(Boolean);
              const castTalent = castIds.map(id => state.contracts.find(t => t.id === id)).filter(Boolean);
              const sp = calcCastStarPower(castTalent);
              return castTalent.length > 0 ? (
                <div className="mt-3 bg-gray-900 rounded p-2">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-amber-400 font-bold">Combined Star Power</span>
                    <span className={`font-bold ${sp >= 70 ? 'text-green-400' : sp >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{sp}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${sp >= 70 ? 'bg-green-500' : sp >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${sp}%` }}></div>
                  </div>
                  {sp < 20 && <div className="text-xs text-gray-500 mt-1">Low star power — marketing will be harder, but sleeper hit potential exists</div>}
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* Talent Demands Warning */}
        {[dir, act, wri].filter(Boolean).some(t => t.demands && t.demands.length > 0) && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
            <div className="text-yellow-400 font-bold text-xs mb-1">Talent Demands</div>
            {[dir, act, wri].filter(Boolean).map(t => t.demands && t.demands.length > 0 ? (
              <div key={t.id} className="text-xs text-yellow-300 mb-0.5">{t.name}: {t.demands.map(d => d.desc).join('; ')}</div>
            ) : null)}
          </div>
        )}

        {/* Filming Location */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
          <div className="text-white font-bold text-xs mb-2">Filming Location</div>
          <select value={state.devLocation || 'hollywood'} onChange={e => dispatch({ type: 'SET_LOCATION', locationId: e.target.value })}
            className="w-full bg-gray-700 text-white text-sm rounded p-2 border border-gray-600">
            {FILMING_LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name} — Tax:{(loc.taxBreak*100).toFixed(0)}% | Cost:{(loc.costMult*100).toFixed(0)}% | +{loc.qualityBonus}Q</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1">{FILMING_LOCATIONS.find(l => l.id === (state.devLocation || 'hollywood'))?.desc}</div>
        </div>

        {/* Target Rating */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-2">Target Rating <span className="text-gray-500 font-normal">(MPAA rating affects audience reach)</span></div>
          <div className="grid grid-cols-5 gap-2">
            {FILM_RATINGS.map(r => {
              const isSelected = state.devRating === r.rating;
              return (
                <button key={r.rating} onClick={() => dispatch({ type: 'SET_DEV', key: 'devRating', value: r.rating })}
                  className={`p-2 rounded text-xs font-bold text-center transition ${isSelected ? 'bg-red-700 text-white border border-red-400' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'}`}>
                  <div className="text-lg">{r.rating}</div>
                  <div className="text-xs text-gray-400 font-normal mt-1">Reach: {Math.round(r.audienceReach * 100)}%</div>
                  {r.controversyRisk > 0 && <div className="text-xs text-red-400 font-normal">Risk: {Math.round(r.controversyRisk * 100)}%</div>}
                </button>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-2">{FILM_RATINGS.find(r => r.rating === state.devRating)?.desc}</div>
        </div>

        {/* Tone Selection */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-2">Tone <span className="text-gray-500 font-normal">(emotional style of the film)</span></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TONES.map(tone => (
              <button key={tone.id} onClick={() => dispatch({ type: 'SET_DEV', key: 'devTone', value: tone.id })}
                className={`p-2 rounded text-xs font-bold transition ${state.devTone === tone.id ? 'bg-indigo-600 text-white border border-indigo-400' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'}`}>
                <div>{tone.name}</div>
                <div className="text-xs text-gray-400 font-normal">{tone.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-1">Themes <span className="text-gray-500 font-normal">(pick up to 2 — shapes story depth and audience connection)</span></div>
          {state.devThemes.length > 0 && (
            <div className="flex gap-1 mb-2">
              {state.devThemes.map(tid => {
                const th = FILM_THEMES.find(t => t.id === tid);
                return th ? (
                  <span key={tid} className="bg-teal-700 text-teal-100 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    {th.name}
                    <button onClick={() => dispatch({ type: 'SET_DEV', key: 'devThemes', value: state.devThemes.filter(id => id !== tid) })} className="text-teal-300 hover:text-white font-bold">×</button>
                  </span>
                ) : null;
              })}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
            {FILM_THEMES.map(theme => {
              const isSelected = state.devThemes.includes(theme.id);
              const isFull = state.devThemes.length >= 2 && !isSelected;
              const synergy = theme.genreBonus.includes(script.genre);
              return (
                <button key={theme.id} disabled={isFull}
                  onClick={() => dispatch({ type: 'SET_DEV', key: 'devThemes', value: isSelected ? state.devThemes.filter(id => id !== theme.id) : [...state.devThemes, theme.id] })}
                  className={`p-1.5 rounded text-xs text-left transition ${isSelected ? 'bg-teal-700 text-white border border-teal-400' : isFull ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'}`}>
                  <div className="font-bold flex items-center gap-1">{theme.name}{synergy && <span className="text-green-400 text-xs" title="Genre synergy">★</span>}</div>
                  <div className="text-xs text-gray-400 font-normal leading-tight">{theme.desc}</div>
                </button>
              );
            })}
          </div>
          {state.devThemes.length === 0 && <div className="text-xs text-gray-500 mt-1">No themes selected. Themes add quality and score bonuses, especially when matched to genre.</div>}
        </div>

        {/* Budget Allocation */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-3">Budget Allocation</div>
          {BUDGET_CATEGORIES.map(cat => {
            const alloc = state.devBudgetAlloc;
            const currentVal = alloc[cat.id] || 0;
            return (
              <div key={cat.id} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{cat.name} — {cat.desc}</span>
                  <span className="text-gray-400">{currentVal}%</span>
                </div>
                <input type="range" min={0} max={60} value={currentVal}
                  onChange={e => dispatch({ type: 'SET_DEV', key: 'devBudgetAlloc', value: { ...alloc, [cat.id]: parseInt(e.target.value) } })}
                  className="w-full accent-blue-500 h-1" />
              </div>
            );
          })}
          <div className="text-xs text-gray-500 mt-2">Total allocated: {Object.values(state.devBudgetAlloc).reduce((a,b)=>a+b,0)}% | Remaining: {100 - Object.values(state.devBudgetAlloc).reduce((a,b)=>a+b,0)}%</div>
        </div>

        {/* Director vs Studio Control */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-white font-bold text-sm">Director vs Studio Control</div>
            <div className="text-xs text-gray-400">{100 - state.devStudioControl}% director / {state.devStudioControl}% studio</div>
          </div>
          <input type="range" min={0} max={100} value={state.devStudioControl}
            onChange={e => dispatch({ type: 'SET_DEV', key: 'devStudioControl', value: parseInt(e.target.value) })}
            className="w-full accent-purple-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Director Control</span><span>Studio Control</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">Director control enhances quality but reduces box office. Studio control boosts commercial appeal.</div>
        </div>

        {/* Marketing Strategy */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-3">Marketing Strategy</div>
          <div className="space-y-2">
            {MARKETING_PHASES.map(phase => {
              const isSelected = state.devMarketingPhases.includes(phase.id);
              return (
                <button key={phase.id} onClick={() => {
                  const phases = isSelected ? state.devMarketingPhases.filter(p => p !== phase.id) : [...state.devMarketingPhases, phase.id];
                  dispatch({ type: 'SET_DEV', key: 'devMarketingPhases', value: phases });
                }}
                  className={`w-full text-left p-2 rounded text-xs transition ${isSelected ? 'bg-teal-600 border border-teal-400' : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'}`}>
                  <div className="flex justify-between">
                    <span className="font-bold text-white">{phase.name}</span>
                    <span className={isSelected ? 'text-white' : 'text-gray-400'}>{(phase.cost * 100).toFixed(0)}% of budget</span>
                  </div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-teal-100' : 'text-gray-500'}`}>{phase.desc}</div>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-2">Total marketing phases: {state.devMarketingPhases.length}</div>
        </div>

        {/* Chemistry indicator */}
        {state.devDirectorId && state.devActorId && (() => {
          const chem = calcChemistry(state.devDirectorId, state.devActorId, state.films);
          return chem.count > 0 ? (
            <div className="bg-gray-800 border border-purple-600 rounded-lg p-3">
              <div className="text-purple-400 font-bold text-xs">Director-Actor Chemistry</div>
              <div className="text-white text-sm">{chem.count} previous collaboration{chem.count > 1 ? 's' : ''} | Avg Quality: {chem.avgQuality} | +{chem.bonus} quality bonus</div>
            </div>
          ) : null;
        })()}

        {projectedQuality !== null && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-white font-bold text-sm">Projected Quality</div>
              <div className="text-amber-400 font-bold">{projectedQuality}/100</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-amber-400 h-3 rounded-full transition-all" style={{ width: `${projectedQuality}%` }}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">(Actual quality may vary ±6 from projection)</div>
          </div>
        )}

        {/* FEATURE 1: RELEASE MONTH TARGETING */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-2">Target Release Month <span className="text-gray-500 font-normal">(optional)</span></div>
          <div className="text-gray-400 text-xs mb-2">Summer (Jun-Aug) is best for blockbusters. Dec-Feb is awards season. Oct is horror month.</div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => dispatch({ type: 'SET_DEV', key: 'devReleaseMonth', value: null })}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${!state.devReleaseMonth ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              Auto
            </button>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
              <button key={i} onClick={() => dispatch({ type: 'SET_DEV', key: 'devReleaseMonth', value: i + 1 })}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${state.devReleaseMonth === i + 1 ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Total Cost</span>
            <span className={canAfford ? 'text-white' : 'text-red-400'}>{fmt(totalCost)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-400">Your Cash</span>
            <span className="text-green-400">{fmt(state.cash)}</span>
          </div>
          {/* Post-Production Plan */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-3">
            <div className="text-white font-bold text-xs mb-2">Post-Production Plan</div>
            <div className="grid grid-cols-1 gap-1">
              {POST_PROD_DECISIONS.map(pp => (
                <label key={pp.id} className={`flex items-start gap-2 p-2 rounded cursor-pointer ${state.devPostProdChoice === pp.id ? 'bg-gray-700 border border-amber-600' : 'bg-gray-900 hover:bg-gray-700'}`}>
                  <input type="radio" checked={state.devPostProdChoice === pp.id} onChange={() => dispatch({ type: 'SET_DEV', key: 'devPostProdChoice', value: pp.id })} className="mt-0.5" />
                  <div>
                    <div className="text-white text-xs font-bold">{pp.name} <span className={`ml-1 ${pp.qualityMod > 0 ? 'text-green-400' : pp.qualityMod < 0 ? 'text-red-400' : 'text-gray-500'}`}>{pp.qualityMod > 0 ? '+' : ''}{pp.qualityMod} quality</span></div>
                    <div className="text-gray-500 text-xs">{pp.desc} {pp.costMult !== 1.0 ? `(${Math.round((pp.costMult - 1) * 100)}% post-prod cost)` : ''}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Release Window Competition Preview */}
          {state.devReleaseMonth && (() => {
            const month = state.devReleaseMonth;
            const season = SEASONAL_COMPETITION[month];
            if (!season) return null;
            return (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-3">
                <div className="text-white font-bold text-xs mb-2">Release Window: {season.name}</div>
                <div className="flex gap-3 text-xs mb-1">
                  <span className={`${season.audienceMult >= 1.1 ? 'text-green-400' : season.audienceMult <= 0.7 ? 'text-red-400' : 'text-gray-400'}`}>Audience: {Math.round(season.audienceMult * 100)}%</span>
                  <span className={`${season.baseCompetitors >= 5 ? 'text-red-400' : 'text-gray-400'}`}>Competition: {season.baseCompetitors}+ films</span>
                  {season.holiday && <span className="text-amber-400">Holiday: {season.holiday}</span>}
                </div>
                <div className="text-gray-500 text-xs">{season.desc}</div>
              </div>
            );
          })()}

          {state.errorMsg && <div className="text-red-400 text-sm mb-3">{state.errorMsg}</div>}
          {!canAfford && <div className="text-red-400 text-sm mb-3">Not enough cash!</div>}
          <button onClick={() => dispatch({ type: 'GREENLIGHT' })} disabled={!canAfford || !hasTeam}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-gray-900 font-bold py-3 rounded-lg transition text-lg">
            GREENLIGHT FILM
          </button>
          <button onClick={() => dispatch({ type: 'CANCEL_SCRIPT' })}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg mt-2 transition text-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderProduction = () => (
    <div>
      <div className="text-white font-bold text-lg mb-1">Production Pipeline</div>
      <div className="text-gray-400 text-sm mb-4">Films advance one stage each turn you end.</div>
      {inPipeline.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No films in production. Head to Develop to greenlight a project.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inPipeline.map(f => (
            <div key={f.id}>
              <FilmCard film={f} />
              {(f.status === 'production' || f.productionPhase === 'principal_photography' || f.productionPhase === 'script_dev') && (
                <div className="mt-1 space-y-1">
                  <div className="text-xs text-gray-400 font-bold">Script Rewrites{f.rewrites?.length > 0 ? ` (${f.rewrites.length} done)` : ''}:</div>
                  {REWRITE_TYPES.map(rw => {
                    const uses = (f.rewrites || []).filter(r => r === rw.id).length;
                    const maxed = uses >= rw.maxUses;
                    const cost = Math.round(f.budget * rw.costPct);
                    const canAffordRw = state.cash >= cost;
                    const genreMatch = rw.genreBonus && rw.genreBonus.includes(f.genre);
                    return (
                      <button key={rw.id} onClick={() => dispatch({ type: 'REWRITE_SCRIPT', filmId: f.id, rewriteId: rw.id })}
                        disabled={maxed || !canAffordRw}
                        className={`w-full text-left p-1.5 rounded text-xs transition border ${maxed ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed' : canAffordRw ? 'bg-indigo-800 border-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'}`}>
                        <div className="flex justify-between">
                          <span className="font-bold">{rw.name}{genreMatch ? ' ★' : ''}</span>
                          <span>{maxed ? `${uses}/${rw.maxUses} used` : fmt(cost)}</span>
                        </div>
                        <div className="text-xs opacity-70">{rw.desc}{rw.months > 0 ? ` (+${rw.months}mo)` : ''}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRelease = () => {
    const completed = state.films.filter(f => f.status === 'completed');
    const scheduled = state.films.filter(f => f.status === 'scheduled');
    // Available months: current + next 5
    const futureMonths = [];
    for (let i = 0; i < 6; i++) {
      let m = state.month + i;
      let y = state.year;
      while (m > 12) { m -= 12; y += 1; }
      futureMonths.push({ month: m, year: y });
    }

    return (
      <div className="space-y-8">
        {/* SCHEDULING SECTION */}
        {completed.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-1">Schedule Release</div>
            <div className="text-gray-400 text-sm mb-4">Choose the perfect release window for your completed films. Genre and timing synergy affects box office!</div>
            {completed.map(film => (
              <div key={film.id} className="bg-gray-800 border border-green-600 rounded-lg p-5 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-white font-bold text-xl">{film.title}</div>
                    <div className="text-amber-400 text-sm">{film.genre} | Quality: {film.quality}/100 | Budget: {fmt(film.budget)}</div>
                  </div>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">READY</span>
                </div>

                <div className="text-white font-bold text-sm mb-3">Choose a Release Window:</div>
                {futureMonths.map(({ month: fm, year: fy }) => {
                  const windows = RELEASE_WINDOWS[fm] || [];
                  const isCurrent = fm === state.month && fy === state.year;
                  return (
                    <div key={`${fy}-${fm}`} className="mb-4">
                      <div className="text-gray-300 text-xs font-bold mb-2 uppercase tracking-wide">
                        {MONTH_FULL[fm - 1]} {fy} {isCurrent ? '(This Month)' : ''}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {windows.map(w => {
                          const mult = getWindowMultiplier(w, film.genre);
                          const multPct = Math.round((mult - 1) * 100);
                          const isGood = multPct > 10;
                          const isBad = multPct < -10;
                          const multColor = isGood ? 'text-green-400' : isBad ? 'text-red-400' : 'text-gray-300';
                          const borderColor = isGood ? 'border-green-600 hover:border-green-400' : isBad ? 'border-red-800 hover:border-red-600' : 'border-gray-600 hover:border-gray-400';
                          return (
                            <button key={w.id}
                              onClick={() => dispatch({ type: 'SCHEDULE_RELEASE', filmId: film.id, windowId: w.id, windowName: w.name, month: fm, year: fy })}
                              className={`bg-gray-700 border ${borderColor} rounded-lg p-3 text-left transition cursor-pointer`}>
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-white font-bold text-sm">{w.name}</div>
                                <div className={`font-bold text-sm ${multColor}`}>{multPct >= 0 ? '+' : ''}{multPct}%</div>
                              </div>
                              <div className="text-gray-400 text-xs mb-1.5">{w.desc}</div>
                              {w.prestigeBonus > 0 && <div className="text-purple-400 text-xs">+{w.prestigeBonus} prestige</div>}
                              {w.genreBonus[film.genre] && <div className="text-green-400 text-xs">Genre synergy: {film.genre} +{Math.round(w.genreBonus[film.genre] * 100)}%</div>}
                              {w.genrePenalty?.[film.genre] && <div className="text-red-400 text-xs">Poor fit: {film.genre} {Math.round(w.genrePenalty[film.genre] * 100)}%</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {!film.testScreened && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <div className="text-xs text-gray-400 font-bold mb-2">Test Screening</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {TEST_SCREENING_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => dispatch({ type: 'TEST_SCREEN', filmId: film.id, optionId: opt.id })}
                          disabled={state.cash < opt.cost}
                          className="flex-1 bg-blue-800 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs py-2 px-2 rounded transition">
                          <div className="font-bold">{opt.name}</div>
                          <div className="text-xs opacity-70">{fmt(opt.cost)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {film.testScreenData && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <div className="text-xs font-bold text-blue-400 mb-2">Screening Results ({film.testScreenData.method})</div>
                    <div className="text-xs text-gray-300 mb-1">Audience: <span className={film.testScreenData.audience >= 60 ? 'text-green-400' : 'text-red-400'}>{film.testScreenData.sentiment} ({film.testScreenData.audience}/100)</span></div>
                    <div className="text-xs text-gray-300 mb-3">Critics est: <span className="text-amber-400">{film.testScreenData.critic}/100</span></div>
                    <div className="text-xs text-gray-500 font-bold mb-2">Reshoot Options:</div>
                    <div className="space-y-2">
                      {RESHOOT_OPTIONS.map(r => {
                        const cost = Math.round(film.budget * r.costPct);
                        return (
                          <button key={r.id} onClick={() => dispatch({ type: 'RESHOOT', filmId: film.id, reshootId: r.id })}
                            disabled={state.cash < cost}
                            className="w-full text-left bg-orange-900 hover:bg-orange-800 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs p-2 rounded transition">
                            <div className="flex justify-between"><span className="font-bold">{r.name}</span><span>{fmt(cost)}</span></div>
                            <div className="opacity-70 text-xs">{r.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULED FILMS */}
        {scheduled.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-1">Scheduled for Release</div>
            <div className="text-gray-400 text-sm mb-3">These films will release when their scheduled month arrives.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scheduled.map(f => {
                const windows = RELEASE_WINDOWS[f.scheduledMonth] || [];
                const window = windows.find(w => w.id === f.releaseWindow);
                return (
                  <div key={f.id} className="bg-gray-800 border border-teal-600 rounded-lg p-4">
                    <div className="text-white font-bold">{f.title}</div>
                    <div className="text-amber-400 text-xs">{f.genre} | Quality: {f.quality}/100</div>
                    <div className="text-teal-400 text-sm mt-2">{window ? window.name : 'Unknown'} — {MONTH_FULL[(f.scheduledMonth || 1) - 1]} {f.scheduledYear}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FILM FESTIVALS */}
        {released.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-1">Film Festivals</div>
            <div className="text-gray-400 text-sm mb-3">Submit your best films for prestige and buzz.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FILM_FESTIVALS.map(fest => (
                <div key={fest.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-white font-bold text-sm">{fest.name}</div>
                  <div className="text-gray-400 text-xs mb-2">Min Quality: {fest.minQuality} | +{fest.prestigeBonus} prestige | +{(fest.grossBonus * 100).toFixed(0)}% gross</div>
                  <div className="text-gray-500 text-xs mb-2">Preferred: {fest.preferredGenres.join(', ')}</div>
                  <select
                    onChange={e => { if (e.target.value) dispatch({ type: 'SUBMIT_FESTIVAL', festivalId: fest.id, filmId: parseInt(e.target.value) }); }}
                    className="w-full bg-gray-700 text-white text-xs rounded p-1.5 border border-gray-600">
                    <option value="">Submit a film...</option>
                    {released.filter(f => f.quality >= fest.minQuality && !state.festivalSubmissions.some(s => s.filmId === f.id && s.festivalId === fest.id))
                      .map(f => <option key={f.id} value={f.id}>{f.title} (Q:{f.quality})</option>)}
                  </select>
                </div>
              ))}
            </div>
            {state.festivalSubmissions.length > 0 && (
              <div className="mt-3">
                <div className="text-gray-400 text-xs font-bold mb-1">Submissions History:</div>
                {state.festivalSubmissions.slice(-8).map((s, i) => {
                  const fest = FILM_FESTIVALS.find(f => f.id === s.festivalId);
                  const film = state.films.find(f => f.id === s.filmId);
                  const color = s.result === 'won' ? 'text-amber-400' : s.result === 'selected' ? 'text-green-400' : 'text-red-400';
                  return <div key={i} className={`text-xs ${color}`}>{film?.title} @ {fest?.name} — {s.result.toUpperCase()} ({s.year})</div>;
                })}
              </div>
            )}
          </div>
        )}

        {/* AWARDS SEASON OVERVIEW */}
        <div>
          <div className="text-white font-bold text-lg mb-1">Awards Season Calendar</div>
          <div className="text-gray-400 text-sm mb-3">Major ceremonies throughout the year. Campaign spending boosts your chances at all shows.</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            {AWARD_SHOWS.map(show => {
              const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              const isUpcoming = show.month > state.month || (show.month <= 3 && state.month >= 10);
              return (
                <div key={show.id} className={`bg-gray-800 border rounded-lg p-2 text-center ${show.isNegative ? 'border-red-700' : (isUpcoming ? 'border-amber-600' : 'border-gray-700')}`}>
                  <div className="text-xl">{show.icon}</div>
                  <div className={`text-xs font-bold ${show.isNegative ? 'text-red-400' : 'text-amber-400'}`}>{show.shortName}</div>
                  <div className="text-xs text-gray-500">{monthNames[show.month - 1]}</div>
                  <div className="text-xs text-gray-600">{show.categories.length} categories</div>
                  {!show.isNegative && <div className="text-xs text-purple-400">+{show.prestigeBonus}p / +{show.reputationBonus}r per win</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* AWARDS CAMPAIGNS */}
        {released.filter(f => f.releasedYear === state.year || f.releasedYear === state.year - 1).length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-1">Awards Campaigns</div>
            <div className="text-gray-400 text-sm mb-3">Invest in FYC campaigns to boost your odds. Choose a strategy and target specific films.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {released.filter(f => f.releasedYear === state.year || f.releasedYear === state.year - 1).slice(0, 6).map(f => {
                const basicSpent = state.awardsCampaigns[f.id] || 0;
                const detailedCampaign = (state.awardsCampaignsDetailed || {})[f.id];
                const filmAwards = state.awards.filter(a => a.film === f.title && !a.isRazzie);
                return (
                  <div key={f.id} className="bg-gray-800 border border-purple-600 rounded-lg p-3">
                    <div className="text-white font-bold text-sm">{f.title} ({f.releasedYear})</div>
                    <div className="flex gap-2 text-xs mb-1">
                      <span className="text-gray-400">Q:{f.quality}</span>
                      <span className={`${f.criticScore >= 80 ? 'text-green-400' : f.criticScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>Critics:{f.criticScore}</span>
                      <span className={`${f.audienceScore >= 80 ? 'text-green-400' : f.audienceScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>Audience:{f.audienceScore}</span>
                      {f.isSleeper && <span className="text-amber-300">SLEEPER HIT</span>}
                    </div>
                    {filmAwards.length > 0 && <div className="text-amber-400 text-xs mb-1">{filmAwards.length} award(s): {filmAwards.map(a => a.show || a.type).join(', ')}</div>}
                    {detailedCampaign && <div className="text-purple-300 text-xs mb-1">Active: {CAMPAIGN_STRATEGIES.find(s => s.id === detailedCampaign.strategy)?.name} ({fmt(detailedCampaign.spent)})</div>}
                    <div className="text-purple-400 text-xs mb-2">Basic lobbying: {fmt(basicSpent)}</div>
                    <input type="range" min="0" max={Math.min(5000000, Math.round(state.cash + basicSpent))} step="100000" value={basicSpent}
                      onChange={(e) => dispatch({ type: 'SET_AWARDS_CAMPAIGN', filmId: f.id, amount: parseInt(e.target.value) })}
                      className="w-full mb-2" />
                    {!detailedCampaign && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {CAMPAIGN_STRATEGIES.map(strat => (
                          <button key={strat.id} onClick={() => dispatch({ type: 'LAUNCH_AWARDS_CAMPAIGN', filmId: f.id, strategy: strat.id })}
                            disabled={state.cash < Math.round(2000000 * strat.costMult)}
                            className="text-xs bg-purple-800 hover:bg-purple-700 disabled:opacity-30 text-white px-2 py-1 rounded transition"
                            title={strat.desc}>
                            {strat.name} ({fmt(Math.round(2000000 * strat.costMult))})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DIRECTOR'S CUT / RE-RELEASES */}
        {released.filter(f => !state.reReleases.some(r => r.filmId === f.id)).length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-1">Director's Cut & Re-Releases</div>
            <div className="text-gray-400 text-sm mb-3">Remaster classic films for a new audience. Older films have more nostalgia value.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {released.filter(f => !state.reReleases.some(r => r.filmId === f.id)).slice(0, 6).map(f => {
                const cost = Math.round(f.budget * 0.15);
                const yearsSince = state.year - f.releasedYear;
                return (
                  <div key={f.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <div className="text-white font-bold text-sm">{f.title} ({f.releasedYear})</div>
                    <div className="text-gray-400 text-xs">{yearsSince} years old | Nostalgia bonus: +{Math.min(yearsSince * 2, 50)}%</div>
                    <button onClick={() => dispatch({ type: 'DIRECTORS_CUT', filmId: f.id })}
                      disabled={state.cash < cost}
                      className="mt-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded transition">
                      Re-Release ({fmt(cost)})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RELEASED FILMS */}
        <div>
          <div className="text-white font-bold text-lg mb-1">Released Films</div>
          <div className="text-gray-400 text-sm mb-4">Total career gross: {fmt(state.totalGross)} | Awards: {state.totalAwards}</div>
          {released.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No films released yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {released.map(f => <ReleasedCard key={f.id} film={f} onCreateFranchise={id => dispatch({ type: 'CREATE_FRANCHISE', filmId: id })} onRemaster={(filmId, formatId) => dispatch({ type: 'REMASTER_FILM', filmId, formatId })} currentYear={state.year} currentCash={state.cash} state={state} />)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTalent = () => {
    const totalSalary = state.contracts.reduce((s, t) => s + t.salary, 0);
    const avgMorale = state.contracts.length > 0 ? Math.round(state.contracts.reduce((s, t) => s + (t.morale || 75), 0) / state.contracts.length) : 0;

    const roleConfig = [
      { type: 'director', label: 'Directors', icon: '🎬' },
      { type: 'actor', label: 'Actors', icon: '⭐' },
      { type: 'writer', label: 'Writers', icon: '📝' },
      { type: 'producer', label: 'Producers', icon: '🎯' },
    ];

    return (
      <div>
        {/* Header with summary stats */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-white font-bold text-lg">Talent Management</div>
            <div className="text-gray-400 text-sm">
              Roster: {state.contracts.length} | Annual salary: {fmt(totalSalary)} | Avg morale: <span className={`${avgMorale >= 70 ? 'text-green-400' : avgMorale >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{avgMorale}</span>
            </div>
          </div>
          <button onClick={() => dispatch({ type: 'BOOST_MORALE' })} disabled={state.cash < 500000 || state.contracts.length === 0}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded transition text-sm">
            Studio Retreat ({fmt(500000)})
          </button>
        </div>

        <WalkOfFame stars={state.walkOfFame || []} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YOUR ROSTER - grouped by role */}
          <div>
            <div className="text-amber-400 font-bold text-sm mb-3">Your Roster ({state.contracts.length})</div>
            {state.contracts.length === 0 ? (
              <div className="text-gray-500 text-sm">No talent signed. Sign some from the available pool!</div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {roleConfig.map(role => {
                  const roleTalent = state.contracts.filter(t => t.type === role.type);
                  if (roleTalent.length === 0) return null;
                  const roleSalary = roleTalent.reduce((s, t) => s + t.salary, 0);
                  return (
                    <div key={role.type}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-lg">{role.icon}</span>
                        <span className="text-white font-bold text-sm">{role.label}</span>
                        <span className="text-gray-500 text-xs">({roleTalent.length})</span>
                        <span className="text-gray-600 text-xs ml-auto">{fmt(roleSalary)}/yr</span>
                      </div>
                      <div className="space-y-1.5">
                        {roleTalent.map(t => (
                          <TalentCard key={t.id} talent={t} action={() => dispatch({ type: 'RELEASE_TALENT', id: t.id })} actionLabel="Release" actionColor="bg-red-600" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AVAILABLE FOR SIGNING - grouped by role */}
          <div>
            <div className="text-amber-400 font-bold text-sm mb-3">Available for Signing ({state.availableTalent.length})</div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {roleConfig.map(role => {
                const roleTalent = state.availableTalent.filter(t => t.type === role.type);
                if (roleTalent.length === 0) return null;
                return (
                  <div key={role.type}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-lg">{role.icon}</span>
                      <span className="text-white font-bold text-sm">{role.label}</span>
                      <span className="text-gray-500 text-xs">({roleTalent.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {roleTalent.map(t => {
                        const sp = calcStarPower(t);
                        return (
                          <div key={t.id} className="relative">
                            <TalentCard talent={t} action={() => dispatch({ type: 'NEGOTIATE_TALENT', talentId: t.id })} actionLabel="Negotiate" actionColor="bg-amber-600" />
                            {sp > 40 && <div className="absolute top-1 right-20 text-xs text-amber-400 font-bold">Star:{sp}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Labor Relations Panel (SYSTEM 4) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-amber-400 font-bold">Labor Relations</div>
            <div className="text-sm text-white font-bold">{LABOR_RELATIONS[state.laborRelations]?.name || 'Neutral'}</div>
          </div>
          <div className="text-xs text-gray-400 mb-3">{LABOR_RELATIONS[state.laborRelations]?.desc || 'Standard industry relations.'}</div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => dispatch({ type: 'SET_LABOR_POLICY', policy: 'generous' })} disabled={state.cash < 2e6}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-xs px-2 py-1 rounded font-bold transition">
              Generous (${fmt(2e6)})
            </button>
            <button onClick={() => dispatch({ type: 'SET_LABOR_POLICY', policy: 'standard' })}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded font-bold transition">
              Standard
            </button>
            <button onClick={() => dispatch({ type: 'SET_LABOR_POLICY', policy: 'lean' })}
              className="bg-red-700 hover:bg-red-600 text-white text-xs px-2 py-1 rounded font-bold transition">
              Lean (+${fmt(1e6)})
            </button>
          </div>
        </div>

        {/* Career Stages Panel (SYSTEM 4) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
          <div className="text-amber-400 font-bold mb-2 text-sm">Talent Career Stages</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {CAREER_STAGES.map(stage => (
              <div key={stage.id} className="bg-gray-700 rounded p-2 border border-gray-600">
                <div className="font-bold text-white">{stage.name}</div>
                <div className="text-gray-400 text-xs">{stage.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Negotiation Modal */}
        {state.pendingNegotiation && (
          <div className="bg-gray-800 border border-amber-500 rounded-lg p-5 mt-4">
            <div className="text-amber-400 font-bold text-lg mb-2">Talent Negotiation</div>
            <div className="text-white mb-1">{state.pendingNegotiation.talentName}'s agent counters:</div>
            <div className="text-gray-300 text-sm mb-1">Salary demand: <span className="text-amber-400 font-bold">{fmt(state.pendingNegotiation.counterOffer)}</span>/yr (was {fmt(state.pendingNegotiation.originalSalary)})</div>
            {state.pendingNegotiation.exclusive && <div className="text-purple-400 text-sm">Demands exclusive deal (+2 years contract)</div>}
            {state.pendingNegotiation.perks && <div className="text-teal-400 text-sm">Perk request: {state.pendingNegotiation.perks}</div>}
            <div className="flex gap-3 mt-3">
              <button onClick={() => dispatch({ type: 'ACCEPT_NEGOTIATION' })}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded transition">Accept Deal</button>
              <button onClick={() => dispatch({ type: 'REJECT_NEGOTIATION' })}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded transition">Walk Away</button>
              <button onClick={() => dispatch({ type: 'SIGN_TALENT', id: state.pendingNegotiation.talentId })}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold px-4 py-2 rounded transition">Sign at Original Rate</button>
            </div>
          </div>
        )}

        {/* TALENT MOODS & RELATIONSHIPS */}
        {state.contracts.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mt-4">
            <div className="text-white font-bold text-lg mb-3">Talent Moods & Perks</div>
            <div className="grid grid-cols-1 gap-2">
              {state.contracts.map(talent => {
                const mood = calcTalentMood(talent);
                const moodLabel = getTalentMoodLabel(mood);
                const demand = calcSalaryDemand(talent);
                return (
                  <div key={talent.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-bold text-sm">{talent.name}</div>
                        <div className={`text-xs font-bold mt-1 ${mood >= 80 ? 'text-green-400' : mood >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{moodLabel} (Mood: {mood}/100)</div>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <div>Current: {fmt(talent.salary)}/film</div>
                        <div>Demands: {fmt(demand)}/film</div>
                      </div>
                    </div>
                    {talent.perks && talent.perks.length > 0 && (
                      <div className="text-xs text-purple-400 mb-2">Perks: {talent.perks.map(p => {
                        const perk = TALENT_PERKS.find(pk => pk.id === p);
                        return perk ? perk.name : p;
                      }).join(', ')}</div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => dispatch({ type: 'NEGOTIATE_SALARY', talentId: talent.id, offer: Math.round(demand * 0.95) })}
                        disabled={state.cash < Math.round(demand * 0.05)}
                        className="text-xs bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white px-2 py-1 rounded transition">
                        Counter-Offer
                      </button>
                      {TALENT_PERKS.slice(0, 2).map(perk => (
                        <button key={perk.id} onClick={() => dispatch({ type: 'GRANT_PERK', talentId: talent.id, perkId: perk.id })}
                          disabled={state.cash < (perk.cost || 0) || (talent.perks || []).includes(perk.id)}
                          className="text-xs bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white px-2 py-1 rounded transition"
                          title={perk.desc}>
                          {perk.name} {perk.cost ? `(${fmt(perk.cost)})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Talent Academy */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mt-4">
          <div className="text-white font-bold text-lg mb-2">Talent Academy</div>
          <div className="text-gray-400 text-sm mb-3">Train your own talent from scratch. Cheaper long-term but takes time.</div>
          <div className="flex gap-2 mb-3">
            {['actor', 'director', 'writer', 'producer'].map(type => (
              <button key={type} onClick={() => dispatch({ type: 'TRAIN_TALENT', talentType: type })}
                disabled={state.cash < 1000000}
                className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-sm px-3 py-1.5 rounded transition capitalize">
                Train {type} ($1M)
              </button>
            ))}
          </div>
          {state.academy.length > 0 && (
            <div className="space-y-2">
              {state.academy.map(t => (
                <div key={t.id} className="flex justify-between bg-gray-700 rounded p-2 text-sm">
                  <span className="text-white">{t.name} ({t.type})</span>
                  <span className="text-gray-400">Skill: {t.skill}/{t.potential} | {t.turnsLeft}Q left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStudio = () => {
    const spec = SPECIALIZATIONS[state.specialization] || SPECIALIZATIONS[0];
    return (
    <div className="max-w-3xl space-y-6">
      <div className={`bg-gray-800 border ${studioColor.border} rounded-lg p-4`}>
        <div className="flex justify-between items-start">
          <div>
            <div className={`text-xl font-bold ${studioColor.accent}`}>{state.studioName}</div>
            {state.studioMotto && <div className="text-gray-400 text-sm italic">"{state.studioMotto}"</div>}
          </div>
          <div className="text-right">
            <div className="text-purple-400 font-bold text-sm">{legacyBench.name}</div>
            <div className="text-gray-400 text-xs">{currentLegacy.toLocaleString()} legacy pts</div>
          </div>
        </div>
        {spec.name !== 'None' && (
          <div className="mt-2 text-xs text-gray-300">Specialization: <span className={`font-bold ${studioColor.accent}`}>{spec.name}</span> — {spec.desc}</div>
        )}
      </div>
      <StudioLotVisual state={state} />
      <div>
        <div className="text-white font-bold text-lg mb-3">Facilities</div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(level => {
            const owned = state.facilitiesLevel >= level;
            const isNext = state.facilitiesLevel === level - 1;
            const cost = facilityCosts[level];
            return (
              <div key={level} className={`rounded-lg p-4 border flex justify-between items-center ${owned ? 'bg-amber-500 border-amber-400' : 'bg-gray-800 border-gray-700'}`}>
                <div>
                  <div className={`font-bold ${owned ? 'text-gray-900' : 'text-white'}`}>Level {level}: {facilityNames[level]}</div>
                  <div className={`text-xs ${owned ? 'text-gray-800' : 'text-gray-400'}`}>
                    {level === 1 ? 'Basic facilities' : level === 2 ? '+10% quality bonus' : level === 3 ? '+20% quality bonus' : level === 4 ? '+30% quality, faster production' : '+40% quality, fastest production'}
                  </div>
                </div>
                {owned && <div className={`font-bold text-sm ${owned ? 'text-gray-900' : ''}`}>OWNED</div>}
                {isNext && (
                  <button onClick={() => dispatch({ type: 'UPGRADE_FACILITIES' })} disabled={state.cash < cost}
                    className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded transition text-sm">
                    Upgrade ({fmt(cost)})
                  </button>
                )}
                {!owned && !isNext && <div className="text-gray-500 text-xs">{fmt(cost)}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-white font-bold text-lg mb-3">Studio Lots</div>
        <div className="text-gray-400 text-sm mb-3">Build stages and backlots. Unused lots earn rental income. Genre-matched lots boost quality.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {STUDIO_LOTS.map(lot => {
            const owned = (state.studioLots || []).filter(l => l.id === lot.id).length;
            return (
              <div key={lot.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-white font-bold text-sm">{lot.name}</div>
                    <div className="text-xs text-gray-400">{lot.desc}</div>
                  </div>
                  {owned > 0 && <span className="text-green-400 text-xs font-bold">×{owned}</span>}
                </div>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>Cost: {fmt(lot.cost)}</span>
                  <span>Upkeep: {fmt(lot.monthlyUpkeep)}/mo</span>
                  <span>Rent: {fmt(lot.rentalIncome)}/mo</span>
                  {lot.genres && <span className="text-amber-400">+{lot.qualityBonus}q: {lot.genres.join(', ')}</span>}
                </div>
                <button onClick={() => dispatch({ type: 'BUILD_LOT', lotId: lot.id })}
                  disabled={state.cash < lot.cost}
                  className="mt-2 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs px-3 py-1 rounded font-bold transition">
                  Build ({fmt(lot.cost)})
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-white font-bold text-lg mb-3">Streaming Platform</div>
        {state.year < 2005 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-400 text-sm">Streaming technology becomes available around 2005. Manage your platform in the Streaming tab.</div>
        ) : !state.streamingPlatform ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-300 text-sm mb-3">Launch your own streaming platform. Cost: $100M. Go to the Streaming tab for full setup.</div>
            <button onClick={() => dispatch({ type: 'LAUNCH_STREAMING' })} disabled={state.cash < 100000000}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-2 rounded transition">
              Launch Platform ({fmt(100000000)})
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold">{state.streamingPlatform.name}</div>
            <div className="text-sm text-gray-400 mt-2">Subscribers: {state.streamingPlatform.subscribers >= 1e6 ? `${(state.streamingPlatform.subscribers / 1e6).toFixed(2)}M` : `${(state.streamingPlatform.subscribers / 1e3).toFixed(0)}K`}</div>
            <div className="text-sm text-gray-400">Monthly Revenue: {fmt(state.streamingPlatform.monthlyRevenue || 0)}</div>
            <div className="text-sm text-gray-400">Launched: {state.streamingPlatform.launchYear}</div>
            <div className="text-sm text-gray-400">Content: {state.streamingPlatform.contentLibrary || 0} titles</div>
            <div className="text-xs text-gray-500 mt-1">Manage in the Streaming tab</div>
          </div>
        )}
      </div>

      <div>
        <div className="text-white font-bold text-lg mb-3">Financing</div>
        <div className="text-gray-400 text-sm mb-3">Take loans to fund ambitious projects. Max 3 active loans.</div>
        {state.loans.length > 0 && (
          <div className="space-y-2 mb-3">
            {state.loans.map(l => (
              <div key={l.id} className="bg-gray-800 border border-red-700 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="text-white font-bold text-sm">{l.name}</div>
                  <div className="text-xs text-gray-400">Principal: {fmt(l.principal)} | Interest: {(l.interestRate * 100).toFixed(1)}%/mo | {l.remainingMonths} months left</div>
                </div>
                <button onClick={() => dispatch({ type: 'REPAY_LOAN', id: l.id })} disabled={state.cash < l.principal}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded font-bold transition">
                  Repay ({fmt(l.principal)})
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {LOAN_OPTIONS.map((loan, i) => (
            <button key={i} onClick={() => dispatch({ type: 'TAKE_LOAN', idx: i })} disabled={state.loans.length >= 3}
              className="bg-gray-800 border border-gray-600 hover:border-green-400 rounded-lg p-3 text-left transition disabled:opacity-40">
              <div className="text-white font-bold text-sm">{loan.name}</div>
              <div className="text-green-400 text-sm">{fmt(loan.amount)}</div>
              <div className="text-xs text-gray-400">{(loan.interestRate * getEraLoanRates(state.year) * (getCreditRating(state).interestMod || 1) * 100).toFixed(1)}%/mo | {loan.termMonths} months</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-white font-bold text-lg mb-3">Distribution Deals</div>
        {state.distributionDeal ? (
          <div className="bg-gray-800 border border-blue-600 rounded-lg p-4">
            <div className="text-white font-bold">{state.distributionDeal.name}</div>
            <div className="text-sm text-gray-400 mt-1">
              Domestic: +{Math.round((state.distributionDeal.domesticBonus || 0) * 100)}%
              {state.distributionDeal.intlBonus ? ` | International: +${Math.round(state.distributionDeal.intlBonus * 100)}%` : ''}
            </div>
            <div className="text-sm text-blue-400 mt-1">{state.distributionTurnsLeft} months remaining</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {DISTRIBUTION_DEALS.map((deal, i) => {
              const canSign = state.cash >= deal.cost && state.reputation >= deal.minRep;
              return (
                <button key={i} onClick={() => dispatch({ type: 'SIGN_DISTRIBUTION', idx: i })} disabled={!canSign}
                  className="bg-gray-800 border border-gray-600 hover:border-blue-400 rounded-lg p-3 text-left transition disabled:opacity-40">
                  <div className="text-white font-bold text-sm">{deal.name}</div>
                  <div className="text-blue-400 text-sm">{fmt(deal.cost)}</div>
                  <div className="text-xs text-gray-400">
                    +{Math.round(deal.domesticBonus * 100)}% domestic{deal.intlBonus ? `, +${Math.round(deal.intlBonus * 100)}% intl` : ''} | {deal.duration}Q
                  </div>
                  {deal.minRep > 0 && <div className="text-xs text-amber-400">Requires {deal.minRep}+ reputation</div>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {state.franchises.length > 0 && (
        <div>
          <div className="text-white font-bold text-lg mb-3">Franchises</div>
          <div className="space-y-2">
            {state.franchises.map(fr => (
              <div key={fr.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="text-white font-bold">{fr.name}</div>
                <div className="text-sm text-gray-400">Films: {fr.filmIds.length} | Total Gross: {fmt(fr.totalGross)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TECH TREE */}
      <div>
        <div className="text-white font-bold text-lg mb-3">Technology Tree</div>
        <div className="text-gray-400 text-sm mb-3">Unlock filmmaking technologies for quality and cost bonuses. ({state.unlockedTech.length}/{TECH_TREE.length} unlocked)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
          {TECH_TREE.filter(t => t.year <= state.year + 10).map(tech => {
            const unlocked = state.unlockedTech.includes(tech.id);
            const canUnlock = !unlocked && state.cash >= tech.cost && state.year >= tech.year;
            const locked = !unlocked && state.year < tech.year;
            return (
              <div key={tech.id} className={`bg-gray-800 border ${unlocked ? 'border-green-600' : canUnlock ? 'border-amber-600' : 'border-gray-700'} rounded-lg p-3`}>
                <div className="flex justify-between">
                  <div className="text-white font-bold text-sm">{tech.name} {unlocked && '✓'}</div>
                  <div className="text-xs text-gray-400">{tech.year}</div>
                </div>
                <div className="text-gray-400 text-xs">{tech.desc}</div>
                <div className="text-teal-400 text-xs mt-1">{tech.unlocks}</div>
                {!unlocked && (
                  <button onClick={() => dispatch({ type: 'UNLOCK_TECH', techId: tech.id })}
                    disabled={!canUnlock}
                    className="mt-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white text-xs px-3 py-1 rounded transition">
                    {locked ? `Available ${tech.year}` : `Unlock (${fmt(tech.cost)})`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TV/SERIES DIVISION */}
      {state.streamingPlatform && (
        <div>
          <div className="text-white font-bold text-lg mb-3">TV Division</div>
          <div className="text-gray-400 text-sm mb-3">Produce shows for your streaming platform.</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {TV_GENRES.map(genre => (
              <button key={genre} onClick={() => dispatch({ type: 'PRODUCE_TV_SHOW', genre })}
                disabled={state.cash < 5000000}
                className="bg-teal-700 hover:bg-teal-600 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded transition">
                {genre} ($5M)
              </button>
            ))}
          </div>
          {state.tvShows.length > 0 && (
            <div className="space-y-2">
              {state.tvShows.map(show => (
                <div key={show.id} className={`bg-gray-800 border ${show.status === 'airing' ? 'border-teal-600' : 'border-red-700'} rounded-lg p-3 flex justify-between`}>
                  <div>
                    <div className="text-white font-bold text-sm">{show.title}</div>
                    <div className="text-xs text-gray-400">{show.genre} | S{show.seasons} | Q:{show.quality}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${show.status === 'airing' ? 'text-green-400' : 'text-red-400'}`}>{show.status}</div>
                    <div className="text-xs text-gray-400">{fmt(show.monthlyRevenue)}/mo</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* THEATER CHAINS */}
      <div>
        <div className="text-white font-bold text-lg mb-3">Theater Chains</div>
        <div className="text-gray-400 text-sm mb-3">Own cinemas for guaranteed screens and ticket revenue.</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {THEATER_CHAINS.map((chain, i) => {
            const owned = state.theaterChains.some(c => c.name === chain.name);
            return (
              <div key={i} className={`bg-gray-800 border ${owned ? 'border-green-600' : 'border-gray-600'} rounded-lg p-3`}>
                <div className="text-white font-bold text-sm">{chain.name} {owned && '(Owned)'}</div>
                <div className="text-xs text-gray-400">{chain.capacity} screens | +{(chain.screenBonus * 100).toFixed(0)}% domestic | {(chain.ticketCut * 100).toFixed(0)}% ticket cut</div>
                {!owned && (
                  <button onClick={() => dispatch({ type: 'BUY_THEATER_CHAIN', chainIdx: i })}
                    disabled={state.cash < chain.cost}
                    className="mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs px-3 py-1 rounded transition">
                    Buy ({fmt(chain.cost)})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* THEME PARKS */}
      <div>
        <div className="text-white font-bold text-lg mb-3">Theme Parks</div>
        <div className="text-gray-400 text-sm mb-3">Build parks around your franchises for massive passive income.</div>
        {state.themeParks.length > 0 && (
          <div className="space-y-2 mb-3">
            {state.themeParks.map((park, i) => (
              <div key={i} className={`bg-gray-800 border ${park.operational ? 'border-green-600' : 'border-amber-600'} rounded-lg p-3`}>
                <div className="text-white font-bold text-sm">{park.name}</div>
                <div className="text-xs text-gray-400">
                  {park.operational ? `Generating ${fmt(park.monthlyRevenue)}/month` : `Under construction: ${park.turnsLeft} months remaining`}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {THEME_PARK_TIERS.map((tier, i) => {
            const canBuild = state.cash >= tier.cost && state.franchises.length >= tier.minFranchises;
            return (
              <button key={i} onClick={() => dispatch({ type: 'BUILD_THEME_PARK', tierIdx: i })}
                disabled={!canBuild}
                className="bg-gray-800 border border-gray-600 hover:border-green-400 rounded-lg p-3 text-left transition disabled:opacity-40">
                <div className="text-white font-bold text-sm">{tier.name}</div>
                <div className="text-green-400 text-sm">{fmt(tier.monthlyRevenue)}/month</div>
                <div className="text-xs text-gray-400">{fmt(tier.cost)} | {tier.buildMonths}mo build | {tier.minFranchises}+ franchises</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* IPO / STOCK MARKET */}
      <div>
        <div className="text-white font-bold text-lg mb-3">IPO & Stock Market</div>
        {state.isPublic ? (
          <div className="bg-gray-800 border border-green-600 rounded-lg p-4">
            <div className="text-green-400 font-bold">PUBLICLY TRADED</div>
            <div className="text-white text-2xl font-bold">${state.stockPrice}/share</div>
            <div className="text-gray-400 text-sm mt-1">Shareholder Demand: <span className={state.shareholderDemand > 60 ? 'text-red-400' : 'text-green-400'}>{state.shareholderDemand}/100</span></div>
            {state.stockHistory.length > 1 && (
              <div className="mt-2 text-xs text-gray-500">
                IPO price: ${state.stockHistory[0]?.price} | Change: {state.stockPrice > state.stockHistory[0]?.price ? '+' : ''}{Math.round(((state.stockPrice / state.stockHistory[0]?.price) - 1) * 100)}%
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Take your studio public for a massive cash injection. Requires: {fmt(IPO_REQUIREMENTS.minCash)} cash, {IPO_REQUIREMENTS.minReputation} rep, {IPO_REQUIREMENTS.minPrestige} prestige, {IPO_REQUIREMENTS.minFilms} films.</div>
            <button onClick={() => dispatch({ type: 'GO_PUBLIC' })}
              disabled={state.cash < IPO_REQUIREMENTS.minCash || state.reputation < IPO_REQUIREMENTS.minReputation || state.prestige < IPO_REQUIREMENTS.minPrestige || state.totalFilmsReleased < IPO_REQUIREMENTS.minFilms}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded transition">
              Go Public (IPO)
            </button>
          </div>
        )}
      </div>

      {/* REVENUE STREAMS SUMMARY */}
      <div>
        <div className="text-white font-bold text-lg mb-3">Revenue Streams</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="text-gray-400 text-xs">Merchandise</div>
            <div className="text-green-400 font-bold">{fmt(state.merchandiseRevenue)}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="text-gray-400 text-xs">Soundtracks</div>
            <div className="text-green-400 font-bold">{fmt(state.soundtrackRevenue)}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="text-gray-400 text-xs">Theme Parks ({state.themeParks.filter(p => p.operational).length})</div>
            <div className="text-green-400 font-bold">{fmt(state.themeParks.filter(p => p.operational).reduce((s, p) => s + p.monthlyRevenue, 0))}/mo</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="text-gray-400 text-xs">TV Shows ({state.tvShows.filter(s => s.status === 'airing').length})</div>
            <div className="text-green-400 font-bold">{fmt(state.tvShows.filter(s => s.status === 'airing').reduce((s, t) => s + t.monthlyRevenue, 0))}/mo</div>
          </div>
        </div>
      </div>

      {/* TAKEOVER WARNING INDICATORS */}
      {!state.hostileTakeoverOffer && state.takeoverWarningLevel === 1 && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
          <div className="text-yellow-400 font-bold text-sm">Acquisition Rumors</div>
          <div className="text-gray-300 text-xs">Industry insiders are speculating about potential acquisition interest. Shore up your finances to discourage further interest.</div>
        </div>
      )}
      {!state.hostileTakeoverOffer && state.takeoverWarningLevel === 2 && (
        <div className="bg-orange-900/40 border border-orange-500 rounded-lg p-4">
          <div className="text-orange-400 font-bold">Activist Investors Circling</div>
          <div className="text-gray-300 text-sm">Activist investors are pushing for a sale or leadership change. A formal takeover bid may follow if your studio continues to struggle.</div>
        </div>
      )}
      {/* HOSTILE TAKEOVER */}
      {state.hostileTakeoverOffer && (
        <div className="bg-red-900 border border-red-500 rounded-lg p-5">
          <div className="text-red-400 font-bold text-lg mb-2">HOSTILE TAKEOVER OFFER</div>
          <div className="text-white mb-2">{state.hostileTakeoverOffer.buyer} offers {fmt(state.hostileTakeoverOffer.offer)} to acquire {state.studioName}.</div>
          <div className="text-gray-400 text-sm mb-2">Deadline: {state.hostileTakeoverOffer.deadline} months left</div>
          <div className="flex gap-3">
            <button onClick={() => dispatch({ type: 'DEFEND_TAKEOVER' })}
              disabled={state.cash < (state.hostileTakeoverOffer?.defenseCost || 0)}
              className="bg-blue-700 hover:bg-blue-600 disabled:opacity-30 text-white font-bold px-4 py-2 rounded">
              Defend ({fmt(state.hostileTakeoverOffer?.defenseCost || 0)})
            </button>
            <button onClick={() => dispatch({ type: 'REJECT_TAKEOVER' })} className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded">Fight It Off</button>
            <button onClick={() => dispatch({ type: 'ACCEPT_TAKEOVER' })} className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded">Accept & End</button>
          </div>
        </div>
      )}

      {/* STUDIO FACILITIES (NEW SYSTEM 7) */}
      <div>
          <div className="text-white font-bold text-lg mb-3">Studio Facilities</div>
          <div className="text-gray-400 text-sm mb-3">Build state-of-the-art facilities to boost quality and unlock new capabilities.</div>
          {state.studioFacilities && state.studioFacilities.length > 0 && (
            <div className="mb-3 p-3 bg-gray-750 border border-green-700 rounded-lg">
              <div className="text-green-400 text-sm font-bold mb-2">Owned Facilities ({state.studioFacilities.length})</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {state.studioFacilities.map((fac, i) => {
                  const def = STUDIO_FACILITIES.find(f => f.id === fac.facilityId);
                  return (
                    <div key={i} className="bg-gray-800 rounded p-2 text-xs">
                      <div className="text-white font-bold">{def?.name || 'Unknown'}</div>
                      <div className="text-gray-400">Upkeep: {fmt(def?.monthlyUpkeep || 0)}/mo</div>
                      <button onClick={() => dispatch({ type: 'DEMOLISH_FACILITY', id: fac.id })} className="text-xs text-red-400 hover:underline mt-1">Demolish</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {STUDIO_FACILITIES.map(facility => {
              const owned = state.studioFacilities && state.studioFacilities.filter(f => f.facilityId === facility.id).length;
              return (
                <div key={facility.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <div className="text-white font-bold text-sm">{facility.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{facility.desc}</div>
                  <div className="text-xs text-amber-400 mt-1">+{facility.qualityBonus}q{facility.genreBonus ? ` (+3 for ${facility.genreBonus.join(', ')})` : ''}</div>
                  <div className="text-xs text-gray-500 mt-1">Cost: {fmt(facility.cost)} | Upkeep: {fmt(facility.monthlyUpkeep)}/mo</div>
                  {owned > 0 && <div className="text-xs text-green-400 mt-1 font-bold">Owned ×{owned}</div>}
                  <button onClick={() => dispatch({ type: 'BUILD_FACILITY', facilityId: facility.id })} disabled={state.cash < facility.cost}
                    className="mt-2 w-full text-xs bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white px-2 py-1 rounded transition">
                    Build ({fmt(facility.cost)})
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CINEMATIC UNIVERSES (NEW SYSTEM 5) */}
        {state.cinematicUniverses && state.cinematicUniverses.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3">Cinematic Universes</div>
            <div className="space-y-3">
              {state.cinematicUniverses.map(u => {
                const tierDef = UNIVERSE_TIERS.find(t => t.id === u.tier);
                return (
                  <div key={u.id} className="bg-gray-800 border border-blue-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-bold text-sm">{u.name}</div>
                        <div className="text-xs text-blue-400 font-bold mt-1">{tierDef?.name || 'Shared'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 text-xs font-bold">Brand Health: {u.brandHealth}/100</div>
                        <div className="text-gray-400 text-xs">{u.franchiseIds.length} franchises | {u.filmCount} films</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded h-2 mb-2">
                      <div className="bg-amber-500 rounded h-2" style={{ width: `${u.brandHealth}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-400">{tierDef?.desc || ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {state.awards.length > 0 && (
        <div>
          <div className="text-white font-bold text-lg mb-3">Awards Cabinet ({state.awards.filter(a => !a.isRazzie).length} wins{state.awards.some(a => a.isRazzie) ? `, ${state.awards.filter(a => a.isRazzie).length} Razzies` : ''})</div>
          <div className="grid grid-cols-2 gap-2">
            {state.awards.slice().reverse().filter(a => !a.isRazzie).map((a, i) => (
              <div key={i} className="bg-gray-800 border border-amber-400 rounded-lg p-3">
                <div className="text-amber-400 text-sm font-bold">{a.type}</div>
                <div className="text-white text-xs">{a.film} ({a.year})</div>
                {a.show && <div className="text-xs text-gray-500 mt-0.5">{a.show}</div>}
              </div>
            ))}
          </div>
          {state.awards.some(a => a.isRazzie) && (
            <div className="mt-3">
              <div className="text-red-400 font-bold text-sm mb-2">Razzie Shelf of Shame</div>
              <div className="grid grid-cols-2 gap-1">
                {state.awards.filter(a => a.isRazzie).map((a, i) => (
                  <div key={i} className="bg-gray-800 border border-red-700 rounded-lg p-2">
                    <div className="text-red-400 text-xs font-bold">{a.type}</div>
                    <div className="text-gray-400 text-xs">{a.film} ({a.year})</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  };

  const renderFinance = () => {
    const released = state.films.filter(f => f.status === 'released');
    const lastEntry = state.cashHistory[state.cashHistory.length - 1] || {};
    const creditRating = getCreditRating(state);

    // Annual aggregation
    const yearlyData = {};
    state.cashHistory.forEach(entry => {
      if (!yearlyData[entry.year]) yearlyData[entry.year] = { revenue: 0, expenses: 0, months: 0 };
      yearlyData[entry.year].revenue += (entry.revenue || 0);
      yearlyData[entry.year].expenses += (entry.expenses || 0);
      yearlyData[entry.year].months += 1;
    });

    return (
      <div className="space-y-6">
        <div className="text-white font-bold text-lg mb-1">Financial Overview</div>

        {/* Credit Rating & Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Credit Rating</div>
            <div className="text-2xl font-bold text-amber-400">{creditRating.name}</div>
            <div className="text-xs text-gray-500">{creditRating.desc}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Last Month Revenue</div>
            <div className="text-green-400 font-bold">{fmt(lastEntry.revenue || 0)}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Last Month Expenses</div>
            <div className="text-red-400 font-bold">{fmt(lastEntry.expenses || 0)}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Active Loans</div>
            <div className="text-white font-bold">{state.loans.length} / {creditRating.maxLoans}</div>
          </div>
        </div>

        {/* Economic Cycle & Era Display (SYSTEM 1 & 3) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="text-amber-400 text-xs font-bold mb-1">FILMMAKING ERA</div>
            <div className="text-white font-bold">{getCurrentFilmEra(state.year).name}</div>
            <div className="text-gray-400 text-xs mt-1">{getCurrentFilmEra(state.year).techDesc}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="text-amber-400 text-xs font-bold mb-1">ECONOMIC CYCLE</div>
            <div className="text-white font-bold">{ECONOMIC_CYCLES.find(c => c.id === state.economicCycle.phase)?.name || 'Stable'}</div>
            <div className="text-gray-400 text-xs mt-1">{ECONOMIC_CYCLES.find(c => c.id === state.economicCycle.phase)?.desc || ''}</div>
          </div>
        </div>

        {/* Acquisitions & Co-Productions (SYSTEM 2) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-3">Acquisitions & Partnerships</div>
          {(state.acquisitions || []).length > 0 && (
            <div className="mb-3 pb-3 border-b border-gray-700">
              <div className="text-xs font-bold text-amber-400 mb-2">Owned Acquisitions:</div>
              <div className="space-y-1">
                {state.acquisitions.map(acq => (
                  <div key={acq.id} className="text-xs bg-green-900/30 border border-green-700 rounded p-2 text-green-200">
                    <div className="font-bold">{acq.name}</div>
                    <div className="text-xs text-gray-300">{acq.benefit}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-xs text-gray-400 mb-3">Acquire studios, agencies, and vendors to unlock special benefits.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ACQUISITION_TARGETS.map(target => {
              const owned = (state.acquisitions || []).find(a => a.id === target.id);
              return (
                <button key={target.id} onClick={() => dispatch({ type: 'ACQUIRE_TARGET', targetId: target.id })}
                  disabled={state.cash < target.baseCost || owned}
                  className={`p-2 rounded text-xs text-left border transition ${owned ? 'bg-green-900/40 border-green-600 text-gray-400 cursor-default' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'}`}>
                  <div className="font-bold">{target.name} {owned ? '✓' : `(${fmt(target.baseCost)})`}</div>
                  <div className="text-gray-400">{target.benefit}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stock Management (SYSTEM 2) */}
        {state.isPublic && (
          <div className="bg-gray-800 border border-blue-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-white font-bold text-sm">Stock Price: <span className="text-blue-400">${state.stockPrice}</span></div>
              <div className="text-xs text-gray-400">Shareholder Demand: {state.shareholderDemand}/100</div>
            </div>
            <div className="text-xs text-gray-400 mb-3">Stock buybacks boost price & shareholder confidence. Dividends calm investors.</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => dispatch({ type: 'STOCK_BUYBACK', amount: 10e6 })} disabled={state.cash < 10e6}
                className="bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white text-xs px-3 py-2 rounded font-bold transition">
                Buyback $10M
              </button>
              <button onClick={() => dispatch({ type: 'PAY_DIVIDEND', amount: 5e6 })} disabled={state.cash < 5e6}
                className="bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white text-xs px-3 py-2 rounded font-bold transition">
                Dividend $5M
              </button>
            </div>
          </div>
        )}

        {/* Tax Deductions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-2">Tax Strategy <span className="text-gray-500 font-normal">(25% annual corporate tax — deductions reduce taxable income)</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {TAX_DEDUCTIONS.map(d => {
              const active = state.taxDeductions.includes(d.id);
              return (
                <button key={d.id} onClick={() => dispatch({ type: 'SET_TAX_DEDUCTION', deductionId: d.id })}
                  className={`p-2 rounded text-xs text-left transition border ${active ? 'bg-green-900/40 border-green-600 text-green-300' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                  <div className="font-bold">{d.name} (-{Math.round(d.rate * 100)}%)</div>
                  <div className="text-gray-400">{d.desc}</div>
                  {d.riskPct && <div className="text-red-400 mt-0.5">Risk: {Math.round(d.riskPct * 100)}% audit chance</div>}
                  {d.cost && <div className="text-amber-400 mt-0.5">Requires {Math.round(d.cost * 100)}% donation</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Per-Film P&L */}
        {released.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-3">Film P&L</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-1 px-2">Title</th>
                    <th className="text-right py-1 px-2">Budget</th>
                    <th className="text-right py-1 px-2">Marketing</th>
                    <th className="text-right py-1 px-2">Gross</th>
                    <th className="text-right py-1 px-2">Profit</th>
                    <th className="text-right py-1 px-2">Licensing</th>
                    <th className="text-right py-1 px-2">ROI</th>
                    <th className="text-right py-1 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {released.sort((a, b) => (b.releasedYear * 12 + b.releasedMonth) - (a.releasedYear * 12 + a.releasedMonth)).slice(0, 20).map(f => {
                    const age = (state.year - f.releasedYear) * 12 + (state.month - (f.releasedMonth || 1));
                    const baseValue = f.totalGross * 0.15;
                    const qualityMult = f.quality >= 80 ? 1.5 : f.quality >= 60 ? 1.2 : 1.0;
                    const ageMult = Math.max(0.3, 1 - age / 240);
                    const salePrice = Math.round(baseValue * qualityMult * ageMult);
                    return (
                      <tr key={f.id} className="border-b border-gray-800 hover:bg-gray-750">
                        <td className="py-1 px-2 text-white">{f.title} <span className="text-gray-500">({f.releasedYear})</span></td>
                        <td className="py-1 px-2 text-right text-gray-300">{fmt(f.budget)}</td>
                        <td className="py-1 px-2 text-right text-gray-300">{fmt(f.marketing)}</td>
                        <td className="py-1 px-2 text-right text-green-400">{fmt(f.totalGross)}</td>
                        <td className={`py-1 px-2 text-right font-bold ${f.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(f.profit)}</td>
                        <td className="py-1 px-2 text-right text-blue-400">{fmt(f.licensingRevenue || 0)}</td>
                        <td className={`py-1 px-2 text-right ${f.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{f.budget > 0 ? Math.round(f.profit / f.budget * 100) : 0}%</td>
                        <td className="py-1 px-2 text-right">
                          {!f.soldRights && (
                            <button onClick={() => dispatch({ type: 'SELL_FILM_RIGHTS', filmId: f.id })}
                              className="text-xs bg-amber-700 hover:bg-amber-600 text-white px-2 py-0.5 rounded transition"
                              title={`Sell for ${fmt(salePrice)}`}>
                              Sell
                            </button>
                          )}
                          {f.soldRights && <span className="text-xs text-gray-400">Sold</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Annual Summary */}
        {Object.keys(yearlyData).length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-3">Annual Summary</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-1 px-2">Year</th>
                    <th className="text-right py-1 px-2">Revenue</th>
                    <th className="text-right py-1 px-2">Expenses</th>
                    <th className="text-right py-1 px-2">Net</th>
                    <th className="text-right py-1 px-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(yearlyData).sort((a, b) => b[0] - a[0]).slice(0, 15).map(([yr, data]) => {
                    const net = data.revenue - data.expenses;
                    const margin = data.revenue > 0 ? Math.round(net / data.revenue * 100) : 0;
                    return (
                      <tr key={yr} className="border-b border-gray-800">
                        <td className="py-1 px-2 text-white">{yr}</td>
                        <td className="py-1 px-2 text-right text-green-400">{fmt(data.revenue)}</td>
                        <td className="py-1 px-2 text-right text-red-400">{fmt(data.expenses)}</td>
                        <td className={`py-1 px-2 text-right font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(net)}</td>
                        <td className={`py-1 px-2 text-right ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DISTRIBUTION & RELEASE STRATEGY (NEW SYSTEMS 6 & 9) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-white font-bold text-sm mb-3">Distribution & Release Strategy</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-gray-400 text-xs mb-2 font-bold">Distribution Tier</div>
              <div className="space-y-1">
                {DISTRIBUTION_TIERS.map(tier => (
                  <button key={tier.id} onClick={() => dispatch({ type: 'SET_DISTRIBUTION_TIER', tier: tier.id })}
                    className={`w-full text-left text-xs rounded p-2 transition ${state.distributionTier === tier.id ? 'bg-green-700 text-white border border-green-500' : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-650'}`}>
                    <div className="font-bold">{tier.name}</div>
                    <div className="text-xs opacity-70">{tier.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-2 font-bold">Theater Relationship</div>
              <div className="bg-gray-700 rounded p-3">
                <div className="w-full bg-gray-600 rounded h-2 mb-2">
                  <div className="bg-amber-500 rounded h-2 transition" style={{ width: `${state.theaterRelationship}%` }}></div>
                </div>
                <div className="text-white font-bold text-sm">{state.theaterRelationship}/100</div>
                <div className="text-gray-400 text-xs mt-2">
                  {state.theaterRelationship >= 80 ? 'Excellent — max screen access' : state.theaterRelationship >= 60 ? 'Good — strong screen access' : state.theaterRelationship >= 40 ? 'Fair — limited screens' : 'Poor — theater chains reluctant'}
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            <div>Current tier provides: {DISTRIBUTION_TIERS.find(t => t.id === state.distributionTier)?.screenAccess}x screen access, {Math.round((DISTRIBUTION_TIERS.find(t => t.id === state.distributionTier)?.marketingSupport || 1) * 100)}% marketing support</div>
          </div>
        </div>

        {/* Stock Management (if public) */}
        {state.isPublic && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-2">Stock Management</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center"><div className="text-xs text-gray-400">Price</div><div className="text-green-400 font-bold">${state.stockPrice}</div></div>
              <div className="text-center"><div className="text-xs text-gray-400">Demand</div><div className={`font-bold ${state.shareholderDemand > 60 ? 'text-red-400' : state.shareholderDemand > 30 ? 'text-amber-400' : 'text-green-400'}`}>{state.shareholderDemand}/100</div></div>
              <div className="text-center"><div className="text-xs text-gray-400">Rating</div><div className="text-amber-400 font-bold">{creditRating.name}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => dispatch({ type: 'STOCK_BUYBACK' })}
                className="bg-blue-700 hover:bg-blue-600 text-white text-xs py-2 rounded font-bold transition">
                Buyback ({fmt(Math.round(state.stockPrice * 100000))})
              </button>
              <button onClick={() => dispatch({ type: 'PAY_DIVIDEND' })}
                className="bg-green-700 hover:bg-green-600 text-white text-xs py-2 rounded font-bold transition">
                Pay Dividend ({fmt(Math.round(state.cash * 0.05))})
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMarket = () => {
    const trendData = GENRES.map(g => ({ genre: g, trend: Math.round((state.genreTrends[g] || 0) * 100) }));
    return (
      <div className="space-y-6">
        <div>
          <div className="text-white font-bold text-lg mb-3">Genre Trends ({era})</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="genre" stroke="#6B7280" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', fontSize: 12 }} />
                <Bar dataKey="trend" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="text-white font-bold text-lg mb-3">Competitor Studios</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.competitors.map((c, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="text-white font-bold text-sm">{c.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${c.tier === 'major' ? 'bg-amber-700 text-amber-200' : c.tier === 'mid' ? 'bg-blue-700 text-blue-200' : 'bg-green-700 text-green-200'}`}>
                    {(c.tier || 'mid').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">Est. {c.founded || '?'}</span>
                </div>
                {c.personality && <span className="text-xs bg-gray-700 text-amber-400 px-2 py-0.5 rounded inline-block mt-2">{c.personality.name}</span>}
                {c.personality && <div className="text-xs text-gray-500 italic mt-0.5">{c.personality.desc}</div>}
                <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                  <div>Reputation: <span className="text-white">{c.reputation}</span> | Prestige: <span className="text-purple-400">{c.prestige || 0}</span></div>
                  <div>Films: <span className="text-white">{c.filmsReleased}</span> | Awards: <span className="text-amber-400">{c.awards || 0}</span></div>
                  <div>Total Gross: <span className="text-green-400">{fmt(c.totalGross)}</span></div>
                  <div>Est. Cash: <span className="text-green-400">{fmt(c.cash)}</span></div>
                </div>
                {c.releasesThisQ > 0 && <div className="text-amber-400 text-xs mt-2 font-bold">Released {c.releasesThisQ} film(s) this month!</div>}
                {(() => {
                  const studioValue = c.cash + c.totalGross * 0.15 + c.reputation * 2e6 + (c.prestige || 0) * 1e6 + (c.awards || 0) * 5e6;
                  const tierPremium = c.tier === 'major' ? 2.5 : c.tier === 'mid' ? 1.8 : 1.2;
                  const cost = Math.round(studioValue * tierPremium);
                  const canAcquire = state.cash >= cost && c.reputation <= state.reputation + 15;
                  return (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Acquisition cost: {fmt(cost)} {c.tier === 'major' ? '(major studio premium)' : ''}</div>
                      <button onClick={() => dispatch({ type: 'ACQUIRE_RIVAL', rivalIdx: i })}
                        disabled={!canAcquire}
                        className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs px-3 py-1.5 rounded transition font-bold">
                        {canAcquire ? `Acquire ${c.name}` : (state.cash < cost ? 'Not enough cash' : 'Too prestigious')}
                      </button>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM 3: AI Studios (SYSTEM 3) */}
        {state.aiStudiosSpawned && state.aiStudiosSpawned.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3 text-red-400">AI STUDIOS (Emerging Competitors)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {state.competitors.filter(c => c.isAI).map((ai, i) => (
                <div key={i} className="bg-red-900/20 border border-red-600 rounded-lg p-3">
                  <div className="text-red-400 font-bold text-sm">{ai.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    <div>Strategy: {ai.personality?.name || 'Unknown'}</div>
                    <div>Founded: {ai.founded}</div>
                    <div>Films: {ai.filmsReleased} | Gross: {fmt(ai.totalGross)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SYSTEM 3: World Events (SYSTEM 3) */}
        {state.activeZeitgeist && state.activeZeitgeist.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3 text-orange-400">WORLD EVENTS & ZEITGEIST</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {state.activeZeitgeist.map((event, i) => (
                <div key={i} className="bg-orange-900/20 border border-orange-600 rounded-lg p-3">
                  <div className="text-orange-400 font-bold text-sm">{event.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    <div>Months left: {event.monthsLeft}</div>
                    <div>Gross multiplier: ×{event.grossMult?.toFixed(2) || '1.00'}</div>
                    {event.streamingBoost && <div>Streaming boost: ×{event.streamingBoost?.toFixed(1) || ''}</div>}
                    {event.qualityMod && <div>Quality mod: {event.qualityMod > 0 ? '+' : ''}{event.qualityMod}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.rivalFilms.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3">Rival Releases This Month</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {state.rivalFilms.map((rf, i) => (
                <div key={i} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-bold text-sm">{rf.title}</div>
                      <div className="text-xs text-gray-400">{rf.studio} | {rf.genre}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 text-sm font-bold">Q:{rf.quality}</div>
                      <div className="text-green-400 text-xs">{fmt(rf.gross)}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>Dir: {rf.director?.name || '?'}</span>
                    <span>Star: {rf.actor?.name || '?'}</span>
                    <span>Critics: {rf.criticScore || '?'}</span>
                    <span>Audience: {rf.audienceScore || '?'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURE 2: FILM CRITICS */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Industry Film Critics</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FILM_CRITICS.map(critic => (
              <div key={critic.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="text-white font-bold text-sm">{critic.name}</div>
                <div className="text-xs text-gray-400">{critic.publication} · {critic.style}</div>
                <div className="text-xs text-gray-500 mt-1">{critic.desc}</div>
                <div className="text-xs mt-2 space-y-0.5">
                  <div><span className="text-green-400">Loves: {critic.genreLove.join(', ')}</span></div>
                  <div><span className="text-red-400">Hates: {critic.genreHate.join(', ')}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-2">Economy</div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>International multiplier: ×{getEraIntlMult(state.year).toFixed(1)}</div>
              <div>Budget range: ${getEraBudgetRange(state.year)[0]}M — ${getEraBudgetRange(state.year)[1]}M</div>
              <div>Consumer mood: {state.year < 1980 ? 'Counter-culture' : state.year < 2000 ? 'Blockbuster hungry' : state.year < 2015 ? 'Spectacle seekers' : state.year < 2035 ? 'Content grazers' : state.year < 2060 ? 'AI-curious' : state.year < 2090 ? 'VR immersionists' : state.year < 2130 ? 'Neural dreamers' : state.year < 2170 ? 'Interstellar audiences' : 'Post-human consciousness'}</div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-2">Distribution</div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Primary: {state.year < 1985 ? 'Theatrical only' : state.year < 2000 ? 'Theatrical + VHS' : state.year < 2010 ? 'Theatrical + DVD' : state.year < 2020 ? 'Theatrical + Streaming' : state.year < 2040 ? 'Streaming dominant' : state.year < 2070 ? 'AI-curated streaming' : state.year < 2100 ? 'VR immersive theaters' : state.year < 2140 ? 'Neural direct-feed' : 'Consciousness broadcast'}</div>
              <div>Home video revenue: ~{fmt(state.totalGross * 0.02 / 12)}/month</div>
              {state.streamingPlatform && <div>Streaming rev: ~{fmt(state.streamingPlatform.subscribers * 1)}/month</div>}
            </div>
          </div>
        </div>

        {/* CO-PRODUCTIONS */}
        {state.competitors.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3">Co-Productions</div>
            <div className="text-gray-400 text-sm mb-3">Partner with rivals to split costs and profits on your next film.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {state.competitors.map((c, i) => (
                <button key={i} onClick={() => dispatch({ type: 'CO_PRODUCE', rivalIdx: i })}
                  disabled={state.coProductions.some(cp => cp.active)}
                  className="bg-gray-800 border border-gray-600 hover:border-blue-400 rounded-lg p-3 text-left transition disabled:opacity-40">
                  <div className="text-white font-bold text-sm">{c.name}</div>
                  <div className="text-xs text-gray-400">50/50 cost and profit split</div>
                </button>
              ))}
            </div>
            {state.coProductions.filter(cp => cp.active).length > 0 && (
              <div className="text-green-400 text-sm mt-2">Active co-production: Next film costs split 50/50!</div>
            )}
          </div>
        )}

        {/* ACQUIRED STUDIOS */}
        {(state.acquiredStudios || []).length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3">Acquired Studios</div>
            <div className="flex flex-wrap gap-2">
              {(state.acquiredStudios || []).map((s, i) => (
                <div key={i} className="bg-gray-800 border border-green-600 rounded-lg px-4 py-2 text-green-400 text-sm font-bold">{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* CULTURAL MOVEMENTS */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Cultural Movements</div>
          <div className="text-gray-400 text-sm mb-3">Active movements affect genre demand and prestige opportunities.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {getActiveMovements(state.year).map((m, i) => (
              <div key={i} className="bg-gray-800 border border-purple-700 rounded-lg p-3">
                <div className="text-purple-400 font-bold text-sm">{m.name}</div>
                <div className="text-xs text-gray-400">{m.desc}</div>
                <div className="text-xs text-gray-500 mt-1">{m.startYear}–{m.endYear} | Boosts: {Object.entries(m.genreBoost).filter(([, v]) => v > 0).map(([g, v]) => `${g} +${Math.round(v * 100)}%`).join(', ')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* INDUSTRY CRISES */}
        {(state.activeCrises || []).length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3">Active Industry Crises</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {state.activeCrises.map((c, i) => (
                <div key={i} className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <div className="text-red-400 font-bold text-sm">{c.name}</div>
                  <div className="text-xs text-red-300 mt-1">{c.effects.desc}</div>
                  <div className="text-xs text-red-400 mt-1">{c.monthsLeft} months remaining</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENRE CYCLES & FATIGUE (NEW SYSTEM 1) */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Genre Cycles & Audience Fatigue</div>
          <div className="text-gray-400 text-sm mb-3">Genres move through cycles. Too many releases in one year causes fatigue (negative gross multiplier).</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {GENRES.map(genre => {
              const cycle = state.genreCycleState && state.genreCycleState[genre];
              const cycleDef = cycle ? GENRE_CYCLES[cycle.phase] : GENRE_CYCLES.stable;
              const fatigueEntries = state.genreFatigueLog && state.genreFatigueLog.filter(f => f.genre === genre && f.year === state.year);
              const isFatigued = fatigueEntries && fatigueEntries.length > 0;
              return (
                <div key={genre} className={`rounded-lg p-2 border ${isFatigued ? 'bg-red-900/30 border-red-600' : 'bg-gray-800 border-gray-700'}`}>
                  <div className="text-white font-bold text-xs">{genre}</div>
                  <div className={`text-xs font-bold mt-1 ${isFatigued ? 'text-red-400' : cycle ? (cycle.phase === 'boom' ? 'text-green-400' : cycle.phase === 'declining' || cycle.phase === 'fatigued' ? 'text-orange-400' : 'text-yellow-400') : 'text-gray-400'}`}>
                    {cycle ? cycleDef.label : 'Stable'}</div>
                  {cycle && <div className="text-xs text-gray-500 mt-1">{cycle.filmsThisYear} releases this year</div>}
                  {isFatigued && <div className="text-xs text-red-400 mt-1">Audience fatigued!</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ZEITGEIST EVENTS (NEW SYSTEM 8) */}
        {state.activeZeitgeist && state.activeZeitgeist.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3">Active Zeitgeist Events</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.activeZeitgeist.map((z, i) => (
                <div key={i} className="bg-blue-900/30 border border-blue-600 rounded-lg p-3">
                  <div className="text-blue-400 font-bold text-sm">{z.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{z.desc}</div>
                  <div className="text-xs text-gray-500 mt-1">{z.monthsLeft} months left | Gross ×{z.grossMult.toFixed(2)}</div>
                  {Object.keys(z.genreBoost || {}).length > 0 && (
                    <div className="text-xs text-blue-300 mt-1">Boosts: {Object.entries(z.genreBoost).filter(([, v]) => v > 0).map(([g, v]) => `${g} +${Math.round(v * 100)}%`).join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIENCE DEMOGRAPHICS */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Audience Demographics</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {DEMOGRAPHICS.map((demo, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="text-white font-bold text-sm">{demo.name} ({demo.ages})</div>
                <div className="text-xs text-gray-400">{(demo.share * 100).toFixed(0)}% of audience</div>
                <div className="text-xs text-gray-500 mt-1">Prefers: {Object.entries(demo.genrePrefs).filter(([, v]) => v > 1.1).sort((a, b) => b[1] - a[1]).map(([g]) => g).join(', ') || 'No strong preference'}</div>
                <div className="text-xs text-gray-500">Best ratings: {Object.entries(demo.ratingPrefs).filter(([, v]) => v > 1.1).sort((a, b) => b[1] - a[1]).map(([r]) => r).join(', ') || 'Any'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FILM RATINGS INFO */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Ratings Board</div>
          <div className="text-gray-400 text-sm mb-3">Films are automatically rated based on genre and content. Ratings affect audience reach.</div>
          <div className="grid grid-cols-5 gap-2">
            {FILM_RATINGS.map((r, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-center">
                <div className="text-white font-bold text-lg">{r.rating}</div>
                <div className="text-xs text-gray-400">{(r.audienceReach * 100).toFixed(0)}% reach</div>
                <div className="text-xs text-gray-500">{(r.controversyRisk * 100).toFixed(0)}% controversy</div>
              </div>
            ))}
          </div>
        </div>

        {/* INDUSTRY FILM HISTORY */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Industry Film History</div>
          <div className="text-gray-400 text-sm mb-3">Every film ever made in the industry. Your library: {(state.allFilmHistory || []).filter(f => !f.isRival || f.studio === state.studioName).length} films. Industry total: {(state.allFilmHistory || []).length} films.</div>

          {/* Awards History by Year */}
          {state.annualAwards.length > 0 && (
            <div className="mb-4">
              <div className="text-white font-bold text-sm mb-2">Awards History</div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(() => {
                  // Group by year, then by show
                  const byYear = {};
                  state.annualAwards.forEach(entry => {
                    if (!byYear[entry.year]) byYear[entry.year] = [];
                    byYear[entry.year].push(entry);
                  });
                  return Object.entries(byYear).sort((a, b) => b[0] - a[0]).map(([year, entries]) => (
                    <div key={year} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="text-amber-400 font-bold text-sm mb-2">{year} Awards Season</div>
                      {entries.map((entry, ei) => {
                        const playerWins = entry.awards.filter(a => !a.isRivalWin).length;
                        return (
                          <div key={ei} className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs font-bold ${entry.isNegative ? 'text-red-400' : 'text-gray-300'}`}>
                                {entry.showIcon || '🏆'} {entry.showName || 'Awards'}
                              </span>
                              <span className="text-xs text-gray-500">{playerWins}/{entry.awards.length} yours</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                              {entry.awards.map((a, ai) => (
                                <div key={ai} className={`text-xs flex items-center gap-1 ${a.isRivalWin ? 'text-gray-600' : (entry.isNegative ? 'text-red-400' : 'text-white')}`}>
                                  <span>{a.isRivalWin ? '·' : (entry.isNegative ? '💩' : '🏆')}</span>
                                  <span className="font-bold truncate">{a.category}:</span>
                                  <span className="truncate">"{a.film}"</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Studio Filmographies */}
          {(() => {
            const history = state.allFilmHistory || [];
            const studioGroups = {};
            history.forEach(f => {
              const studio = f.studio || 'Unknown';
              if (!studioGroups[studio]) studioGroups[studio] = [];
              studioGroups[studio].push(f);
            });
            // Sort studios: player first, then by film count
            const studioNames = Object.keys(studioGroups).sort((a, b) => {
              if (a === state.studioName) return -1;
              if (b === state.studioName) return 1;
              return studioGroups[b].length - studioGroups[a].length;
            });
            return (
              <div className="space-y-3">
                <div className="text-white font-bold text-sm mb-1">Studio Filmographies</div>
                {studioNames.map(studio => {
                  const studioFilms = studioGroups[studio].sort((a, b) => (b.releasedYear || 0) - (a.releasedYear || 0) || (b.releasedMonth || 0) - (a.releasedMonth || 0));
                  const totalGross = studioFilms.reduce((s, f) => s + (f.totalGross || 0), 0);
                  const avgQuality = studioFilms.length > 0 ? Math.round(studioFilms.reduce((s, f) => s + (f.quality || 0), 0) / studioFilms.length) : 0;
                  const isPlayer = studio === state.studioName;
                  const isAcquired = state.acquiredStudios.includes(studio);
                  return (
                    <details key={studio} className={`bg-gray-800 border ${isPlayer ? 'border-amber-600' : 'border-gray-700'} rounded-lg`}>
                      <summary className="p-3 cursor-pointer hover:bg-gray-750 transition">
                        <div className="inline-flex items-center gap-2 w-full">
                          <span className={`font-bold text-sm ${isPlayer ? 'text-amber-400' : 'text-white'}`}>{studio}</span>
                          {isAcquired && <span className="text-xs bg-red-900 text-red-300 px-1.5 py-0.5 rounded">Acquired</span>}
                          <span className="text-xs text-gray-400 ml-auto">{studioFilms.length} films | {fmt(totalGross)} gross | Avg Q: {avgQuality}</span>
                        </div>
                      </summary>
                      <div className="px-3 pb-3 max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b border-gray-700">
                              <th className="text-left py-1">Title</th>
                              <th className="text-left">Genre</th>
                              <th className="text-right">Year</th>
                              <th className="text-right">Quality</th>
                              <th className="text-right">Gross</th>
                              {isPlayer && <th className="text-right">Profit</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {studioFilms.map((f, fi) => (
                              <tr key={fi} className="border-b border-gray-800 hover:bg-gray-750">
                                <td className={`py-1 ${f.acquiredFrom ? 'text-gray-400' : 'text-white'}`}>
                                  {f.title}
                                  {f.acquiredFrom && <span className="text-xs text-gray-600 ml-1">(from {f.originalStudio || f.acquiredFrom})</span>}
                                </td>
                                <td className="text-amber-400">{f.genre}</td>
                                <td className="text-right text-gray-400">{f.releasedYear}</td>
                                <td className="text-right"><span className={f.quality >= 80 ? 'text-green-400' : f.quality >= 60 ? 'text-yellow-400' : f.quality >= 40 ? 'text-orange-400' : 'text-red-400'}>{f.quality || '?'}</span></td>
                                <td className="text-right text-green-400">{fmt(f.totalGross || 0)}</td>
                                {isPlayer && <td className={`text-right ${(f.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(f.profit || 0)}</td>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Intelligence & Espionage */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Intelligence & Espionage</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-gray-400 text-sm">Studio Security: </span>
                <span className="text-amber-400 font-bold">{state.studioSecurity || 0}%</span>
              </div>
              <button onClick={() => dispatch({ type: 'UPGRADE_SECURITY' })}
                disabled={state.cash < 5e6}
                className="bg-blue-700 hover:bg-blue-600 disabled:opacity-30 text-white text-xs px-3 py-1.5 rounded">
                Upgrade Security ({fmt(5e6)})
              </button>
            </div>
            <div className="text-amber-400 font-bold text-sm mb-2">Launch Operations</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PLAYER_ESPIONAGE.map(esp => (
                <div key={esp.id} className="bg-gray-900 border border-gray-600 rounded p-2">
                  <div className="text-white text-xs font-bold">{esp.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{esp.desc}</div>
                  <div className="text-xs mt-1">
                    <span className="text-green-400">Success: {Math.round(esp.successChance * 100)}%</span>
                    <span className="text-red-400 ml-2">Caught: {Math.round(esp.caughtChance * 100)}%</span>
                    <span className="text-gray-500 ml-2">Cost: {fmt(esp.cost)}</span>
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {state.competitors.slice(0, 5).map(c => (
                      <button key={c.name} onClick={() => dispatch({ type: 'LAUNCH_ESPIONAGE', espionageId: esp.id, targetRival: c.name })}
                        disabled={state.cash < esp.cost}
                        className="bg-red-800 hover:bg-red-700 disabled:opacity-30 text-white text-xs px-2 py-0.5 rounded truncate max-w-24">
                        {c.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {(state.espionageLog || []).length > 0 && (
              <div className="mt-3">
                <div className="text-gray-400 text-xs font-bold mb-1">Recent Intelligence</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {(state.espionageLog || []).slice(-8).reverse().map((e, i) => (
                    <div key={`${e.turn}-${e.type}-${e.rival}`} className={`text-xs px-2 py-1 rounded ${e.result === 'success' ? 'bg-green-900/30 text-green-400' : e.result === 'blocked' ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'}`}>
                      {e.desc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Industry Politics */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Industry Politics</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-amber-400 font-bold text-sm mb-2">Coalitions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {INDUSTRY_COALITIONS.map(c => (
                <div key={c.id} className={`bg-gray-900 border rounded p-2 ${state.playerCoalition === c.id ? 'border-amber-500' : 'border-gray-600'}`}>
                  <div className="text-white text-xs font-bold">{c.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{c.desc}</div>
                  {state.playerCoalition === c.id ? (
                    <button onClick={() => dispatch({ type: 'LEAVE_COALITION' })} className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 py-0.5 rounded mt-1">Leave</button>
                  ) : (
                    <button onClick={() => dispatch({ type: 'JOIN_COALITION', coalitionId: c.id })}
                      disabled={state.playerCoalition !== null}
                      className="bg-amber-700 hover:bg-amber-600 disabled:opacity-30 text-white text-xs px-2 py-0.5 rounded mt-1">Join</button>
                  )}
                </div>
              ))}
            </div>

            <div className="text-amber-400 font-bold text-sm mb-2">Lobby for Regulations</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {LOBBY_REGULATIONS.map(r => (
                <button key={r.id} onClick={() => dispatch({ type: 'LOBBY_REGULATION', regulationId: r.id })}
                  disabled={state.cash < 10e6}
                  className="bg-purple-800 hover:bg-purple-700 disabled:opacity-30 text-white text-xs p-2 rounded text-left">
                  <div className="font-bold">{r.name} ({fmt(10e6)})</div>
                  <div className="text-purple-300 text-xs mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>

            {(state.activeRegulations || []).length > 0 && (
              <div className="mt-2">
                <div className="text-green-400 text-xs font-bold">Active Regulations:</div>
                {(state.activeRegulations || []).map((r, i) => (
                  <div key={i} className="text-xs text-green-300">{r.name} ({r.monthsLeft} months left)</div>
                ))}
              </div>
            )}

            {(state.rivalAlliances || []).length > 0 && (
              <div className="mt-2">
                <div className="text-red-400 text-xs font-bold">Active Rival Alliances:</div>
                {(state.rivalAlliances || []).map((a, i) => (
                  <div key={i} className="text-xs text-red-300">{a.studios.join(' & ')} — {a.purpose} ({a.monthsLeft}mo left)</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Adaptive Difficulty & Market Intelligence */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Market Intelligence</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-gray-400 text-sm">Competition Level: <span className={`font-bold ${(state.difficultyScale || 1) >= 1.5 ? 'text-red-400' : (state.difficultyScale || 1) >= 1.2 ? 'text-amber-400' : 'text-green-400'}`}>{((state.difficultyScale || 1) * 100).toFixed(0)}%</span></div>
              <div className="text-gray-400 text-sm">Active Rivals: <span className="text-white font-bold">{state.competitors.length}</span></div>
            </div>
            <div className="text-amber-400 font-bold text-sm mb-1">Your Genre Dominance</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(state.rivalMarketShare || {}).filter(([, v]) => v > 0.1).sort((a, b) => b[1] - a[1]).map(([genre, share]) => (
                <span key={genre} className={`text-xs px-2 py-0.5 rounded ${share > 0.3 ? 'bg-green-800 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                  {genre}: {Math.round(share * 100)}%
                </span>
              ))}
            </div>
            {(state.twinFilmWarnings || []).length > 0 && (
              <div className="mt-2">
                <div className="text-red-400 text-xs font-bold">Twin Film Warnings:</div>
                {state.twinFilmWarnings.map((w, i) => (
                  <div key={i} className="text-xs text-red-300">{w.rivalName} developing a {w.genre} film similar to yours!</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==================== NEW SYSTEMS RENDER FUNCTIONS ====================

  const renderCatalog = () => {
    const releasedFilms = state.films.filter(f => f.status === 'released').sort((a, b) => (b.releasedYear || 0) - (a.releasedYear || 0));
    const cultClassics = releasedFilms.filter(f => {
      const age = state.year - (f.releasedYear || state.year);
      return age >= CULT_CLASSIC_THRESHOLD && f.quality >= CULT_CLASSIC_QUALITY_MIN && f.quality <= CULT_CLASSIC_QUALITY_MAX;
    });

    return (
      <div className="space-y-6">
        <div>
          <div className="text-white font-bold text-lg mb-3">Catalog Revenue Streams</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="text-gray-400 text-xs">Monthly Catalog Revenue</div>
              <div className="text-green-400 text-2xl font-bold mt-1">{fmt(state.catalogRevenue)}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="text-gray-400 text-xs">Cult Classics</div>
              <div className="text-purple-400 text-2xl font-bold mt-1">{cultClassics.length}</div>
            </div>
          </div>

          <div className="text-white font-bold text-sm mb-2">Revenue Stream Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {CATALOG_REVENUE_STREAMS.map(stream => (
              <div key={stream.id} className="bg-gray-800 border border-gray-700 rounded p-2">
                <div className="font-bold text-amber-400">{stream.name}</div>
                <div className="text-gray-400">Starts: Year {stream.yearsAfterRelease} | {Math.round(stream.annualRevPct * 100)}% of gross/year</div>
              </div>
            ))}
          </div>
        </div>

        {cultClassics.length > 0 && (
          <div>
            <div className="text-white font-bold text-lg mb-3">Cult Classics</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cultClassics.map(f => (
                <div key={f.id} className="bg-purple-900/30 border border-purple-600 rounded-lg p-3">
                  <div className="text-purple-400 font-bold">{f.title}</div>
                  <div className="text-xs text-gray-400 mt-1">Released {f.releasedYear} | Quality {f.quality}</div>
                  <div className="text-xs text-gray-300 mt-1">Age: {state.year - f.releasedYear} years — Premium catalog value with 2.5x revenue boost!</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-white font-bold text-lg mb-3">Recent Releases & Catalog Value</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-700">
                  <th className="text-left py-2 px-2">Title</th>
                  <th className="text-left px-2">Genre</th>
                  <th className="text-right px-2">Released</th>
                  <th className="text-right px-2">Quality</th>
                  <th className="text-right px-2">Gross</th>
                  <th className="text-right px-2">Monthly Catalog Value</th>
                </tr>
              </thead>
              <tbody>
                {releasedFilms.slice(0, 20).map(f => {
                  const catVal = calcCatalogValue(f, state.year);
                  return (
                    <tr key={f.id} className="border-b border-gray-800 hover:bg-gray-750">
                      <td className="py-2 px-2 text-white">{f.title}</td>
                      <td className="px-2 text-amber-400">{f.genre}</td>
                      <td className="text-right px-2 text-gray-400">{f.releasedYear}</td>
                      <td className={`text-right px-2 ${f.quality >= 80 ? 'text-green-400' : f.quality >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>{f.quality}</td>
                      <td className="text-right px-2 text-green-400">{fmt(f.totalGross || 0)}</td>
                      <td className={`text-right px-2 ${catVal > 0 ? 'text-purple-400' : 'text-gray-500'}`}>{fmt(catVal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ==================== BATCH 4 RENDER FUNCTIONS ====================

  const renderPress = () => (
    <div className="space-y-6">
      <div>
        <div className="text-white font-bold text-lg mb-3">Active Press Events</div>
        {state.pressEvents.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-400 text-sm">No active press events. Check back next month!</div>
        ) : (
          <div className="space-y-3">
            {state.pressEvents.map((evt, i) => {
              const template = PRESS_EVENTS.find(e => e.id === evt.type);
              return (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-white font-bold">{evt.name}</div>
                      <div className="text-gray-400 text-sm">{evt.desc}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                    <div>Rep Impact: {evt.repChange > 0 ? '+' : ''}{evt.repChange} | Pres Impact: {evt.prestigeChange > 0 ? '+' : ''}{evt.prestigeChange}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {PRESS_RESPONSES.map(r => (
                      <button key={r.id} onClick={() => dispatch({ type: 'HANDLE_PRESS', eventId: evt.id, response: r.id })}
                        className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition">
                        {r.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="text-white font-bold text-lg mb-3">How Press Events Work</div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-400 text-sm space-y-2">
          <p>Random press events occur throughout your studio's history. How you respond affects your reputation and prestige!</p>
          <p><strong>Ignore:</strong> Minimal impact, quickly forgotten.</p>
          <p><strong>Deny:</strong> Risk backfiring with angry press. 40% chance of worse outcome.</p>
          <p><strong>Lean In:</strong> Maximize buzz but sacrifice prestige.</p>
          <p><strong>Apologize:</strong> Sacrifice rep but gain prestige and move on cleanly.</p>
        </div>
      </div>
      {/* Newspaper Archive — collapsible */}
      {(state.newspaperArchive || []).length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-gray-400 hover:text-amber-400 text-sm font-bold flex items-center gap-1">
            📰 Newspaper Archive ({(state.newspaperArchive || []).length} stories)
          </summary>
          <div className="mt-2">
            <NewspaperArchive archive={state.newspaperArchive || []} />
          </div>
        </details>
      )}
    </div>
  );

  const renderAcademy = () => (
    <div className="space-y-6">
      <div>
        <div className="text-white font-bold text-lg mb-3">Film School Pipeline</div>
        <div className="text-gray-400 text-sm mb-4">Fund film schools to develop cheaper but riskier talent. Schools produce graduates regularly!</div>

        {(state.filmSchools || []).length === 0 ? (
          <div className="text-gray-400 text-sm mb-4">No schools funded yet. Start investing to build your talent pipeline.</div>
        ) : (
          <div className="space-y-3 mb-4">
            {(state.filmSchools || []).map((fs, i) => {
              const schoolDef = FILM_SCHOOLS.find(s => s.id === fs.schoolId);
              const turnsToGraduate = Math.max(0, fs.nextGraduate - state.turn);
              return (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-white font-bold">{schoolDef?.name}</div>
                      <div className="text-gray-400 text-xs">Founded {state.year - Math.floor(fs.founded / 12)} | {schoolDef?.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 text-sm font-bold">{turnsToGraduate} months</div>
                      <div className="text-gray-500 text-xs">until graduate</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">Quality range: {schoolDef?.talentQualityRange[0]}–{schoolDef?.talentQualityRange[1]} | Salary: {(schoolDef?.salaryMult || 0).toFixed(1)}x base</div>
                  <div className="text-xs text-gray-500 mt-1">Monthly upkeep: {fmt(schoolDef?.monthlyUpkeep || 0)}</div>
                </div>
              );
            })}
          </div>
        )}

        <div>
          <div className="text-white font-bold text-sm mb-2">Available Schools to Fund</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FILM_SCHOOLS.map((school, i) => {
              const alreadyHas = state.filmSchools.some(fs => fs.schoolId === school.id);
              return (
                <div key={i} className={`bg-gray-800 border border-gray-700 rounded-lg p-3 ${alreadyHas ? 'opacity-50' : ''}`}>
                  <div className="text-white font-bold text-sm mb-1">{school.name}</div>
                  <div className="text-gray-400 text-xs mb-2">{school.desc}</div>
                  <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                    <div>Initial cost: {fmt(school.cost)}</div>
                    <div>Monthly upkeep: {fmt(school.monthlyUpkeep)}</div>
                    <div>Grad interval: {school.graduateInterval} months</div>
                    <div>Talent quality: {school.talentQualityRange[0]}–{school.talentQualityRange[1]}</div>
                  </div>
                  <button onClick={() => dispatch({ type: 'FUND_SCHOOL', schoolId: school.id })}
                    disabled={alreadyHas || state.cash < school.cost}
                    className="w-full bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 text-white text-xs px-3 py-1 rounded transition">
                    {alreadyHas ? 'Operating' : state.cash < school.cost ? 'Not Enough Cash' : 'Fund'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPartners = () => (
    <div className="space-y-6">
      <div>
        <div className="text-white font-bold text-lg mb-3">International Studio Partnerships</div>
        <div className="text-gray-400 text-sm mb-4">Partner with regional studios to access new markets, genres, and talent!</div>

        {(state.internationalPartners || []).length === 0 ? (
          <div className="text-gray-400 text-sm mb-4">No partnerships yet. Form partnerships to expand globally.</div>
        ) : (
          <div className="space-y-3 mb-4">
            {(state.internationalPartners || []).map((ip, i) => {
              const partnerDef = INTERNATIONAL_PARTNERS.find(p => p.id === ip.partnerId);
              return (
                <div key={i} className="bg-gray-800 border border-blue-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-blue-400 font-bold">{partnerDef?.name}</div>
                      <div className="text-gray-400 text-xs">{partnerDef?.region} | Formed {ip.formDate}</div>
                    </div>
                    <button onClick={() => dispatch({ type: 'DISSOLVE_PARTNERSHIP', partnerId: ip.id })}
                      className="bg-red-700 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition">
                      End
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Genres: {partnerDef?.genres.join(', ')}</div>
                    <div>Monthly fee: {fmt(partnerDef?.monthlyFee || 0)}</div>
                    <div className="text-green-400">Regional bonuses active for these genres on international markets</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div>
          <div className="text-white font-bold text-sm mb-2">Available Partners</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {INTERNATIONAL_PARTNERS.map((partner, i) => {
              const hasPartner = state.internationalPartners.some(ip => ip.partnerId === partner.id);
              return (
                <div key={i} className={`bg-gray-800 border border-gray-700 rounded-lg p-3 ${hasPartner ? 'opacity-50' : ''}`}>
                  <div className="text-white font-bold text-sm mb-1">{partner.name}</div>
                  <div className="text-gray-400 text-xs mb-2">{partner.region} | {partner.desc}</div>
                  <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                    <div>Monthly fee: {fmt(partner.monthlyFee)}</div>
                    <div>Genres: {partner.genres.join(', ')}</div>
                    <div>Talent discount: {Math.round(partner.talentSalaryBonus * 100)}%</div>
                  </div>
                  <button onClick={() => dispatch({ type: 'FORM_PARTNERSHIP', partnerId: partner.id })}
                    disabled={hasPartner}
                    className="w-full bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 text-white text-xs px-3 py-1 rounded transition">
                    {hasPartner ? 'Partner' : 'Form Partnership'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStreaming = () => {
    const platform = state.streamingPlatform;
    const airingShows = state.tvShows.filter(s => s.status === 'airing');
    const inDevShows = state.tvShows.filter(s => s.status === 'development' || s.status === 'production');
    const cancelledShows = state.tvShows.filter(s => s.status === 'cancelled');
    const endedShows = state.tvShows.filter(s => s.status === 'ended');
    const showrunners = state.contracts.filter(t => t.type === 'showrunner');

    return (
      <div className="space-y-6">
        <div className="text-2xl font-bold text-purple-400 mb-4">📺 TV & Streaming</div>

        {/* Streaming Platform Section */}
        <div className="mb-6">
          <div className="text-lg font-bold text-blue-400 mb-2">Streaming Platform</div>
          {state.year < 2005 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-500 text-center py-4">
                <div className="text-4xl mb-3">📡</div>
                <div className="text-lg font-bold text-gray-400 mb-2">Streaming Technology Not Yet Available</div>
                <div className="text-sm text-gray-500">The internet infrastructure for video streaming hasn't been developed yet. Streaming services will become possible around 2005-2010.</div>
                <div className="text-xs text-gray-600 mt-2">Current year: {state.year} · Streaming era begins: ~2005</div>
              </div>
            </div>
          ) : !platform ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 mb-3">Launch your own streaming service to build recurring revenue and distribute content directly to audiences.</div>
              <div className="text-sm text-gray-500 mb-2">Cost: $100M launch investment | Your entire back catalog ({state.films.filter(f => f.status === 'released').length} films) will be added automatically.</div>
              {/* Show rival streamers already in the market */}
              {RIVAL_STREAMERS.filter(s => s.founded <= state.year).length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Competing platforms already in the market:</div>
                  <div className="flex flex-wrap gap-1">
                    {RIVAL_STREAMERS.filter(s => s.founded <= state.year).map(s => (
                      <span key={s.name} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{s.name} (est. {s.founded})</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 items-center mb-3 flex-wrap">
                <input type="text" placeholder="Platform name..." className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm w-48" value={state._streamingName || ''} onChange={e => dispatch({ type: 'SET_TV_DEV', field: '_streamingName', value: e.target.value })} />
                <select className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm" value={state._streamingTier || 'standard'} onChange={e => dispatch({ type: 'SET_TV_DEV', field: '_streamingTier', value: e.target.value })}>
                  {STREAMING_TIERS.map(t => <option key={t.id} value={t.id}>{t.name} (${t.monthlyPrice}/mo)</option>)}
                </select>
              </div>
              <button onClick={() => dispatch({ type: 'LAUNCH_STREAMING' })} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-lg transition">
                Launch Streaming Platform ($100M)
              </button>
              {state.errorMsg && <div className="text-red-400 text-sm mt-2">{state.errorMsg}</div>}
            </div>
          ) : (
            <div className="bg-gray-800 border border-purple-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xl font-bold text-purple-300">{platform.name}</div>
                <div className="text-sm text-gray-400">Launched {platform.launchYear}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{platform.subscribers >= 1e6 ? `${(platform.subscribers / 1e6).toFixed(1)}M` : `${(platform.subscribers / 1e3).toFixed(0)}K`}</div>
                  <div className="text-xs text-gray-500">Subscribers</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{fmt(platform.monthlyRevenue)}</div>
                  <div className="text-xs text-gray-500">Monthly Revenue</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-400">{platform.contentLibrary || 0}</div>
                  <div className="text-xs text-gray-500">Content Library</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-400">{Math.round((platform.churnRate || 0.04) * 100)}%</div>
                  <div className="text-xs text-gray-500">Monthly Churn</div>
                </div>
              </div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {STREAMING_TIERS.map(t => (
                  <button key={t.id} onClick={() => dispatch({ type: 'SET_STREAMING_TIER', tier: t.id })} className={`px-3 py-1 rounded text-sm font-bold ${platform.tier === t.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>{t.name}</button>
                ))}
                <button onClick={() => dispatch({ type: 'TOGGLE_AD_TIER' })} className={`px-3 py-1 rounded text-sm font-bold ${platform.adTier ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                  {platform.adTier ? '✓ Ad Tier Active' : 'Add Ad Tier'}
                </button>
              </div>
              <div className="flex gap-2 mb-3">
                {[5e6, 10e6, 25e6].map(amt => (
                  <button key={amt} onClick={() => dispatch({ type: 'STREAMING_MARKETING', amount: amt })} className="bg-blue-700 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded">
                    Market {fmt(amt)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Catalog Management */}
        {platform && (() => {
          const catalogFilmIds = new Set(platform.catalogFilmIds || []);
          const catalogShowIds = new Set(platform.catalogShowIds || []);
          const releasedFilms = state.films.filter(f => f.status === 'released');
          const notInCatalogFilms = releasedFilms.filter(f => !catalogFilmIds.has(f.id));
          const inCatalogFilms = releasedFilms.filter(f => catalogFilmIds.has(f.id));
          const availableShows = state.tvShows.filter(s => (s.status === 'airing' || s.status === 'ended') && !catalogShowIds.has(s.id));
          const inCatalogShows = state.tvShows.filter(s => catalogShowIds.has(s.id));
          return (
            <div className="mb-6">
              <div className="text-lg font-bold text-amber-400 mb-2">Content Catalog ({(platform.catalogFilmIds || []).length + (platform.catalogShowIds || []).length} titles on {platform.name})</div>
              <div className="bg-gray-800 border border-amber-700/50 rounded-lg p-4">
                {notInCatalogFilms.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-bold text-gray-300 mb-2">Films Not Yet on Platform ({notInCatalogFilms.length})</div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {notInCatalogFilms.sort((a, b) => (b.quality || 0) - (a.quality || 0)).map(f => (
                        <div key={f.id} className="flex justify-between items-center bg-gray-900 rounded px-3 py-1.5 text-sm">
                          <div>
                            <span className="text-white">{f.title}</span>
                            <span className="text-gray-500 text-xs ml-2">{f.genre} · Q:{f.quality} · {f.releasedYear}</span>
                          </div>
                          <button onClick={() => dispatch({ type: 'ADD_TO_CATALOG', contentId: f.id, contentType: 'film' })} className="bg-amber-700 hover:bg-amber-600 text-white text-xs px-2 py-0.5 rounded">
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => notInCatalogFilms.forEach(f => dispatch({ type: 'ADD_TO_CATALOG', contentId: f.id, contentType: 'film' }))} className="mt-2 bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1 rounded">
                      Add All Films ({notInCatalogFilms.length})
                    </button>
                  </div>
                )}
                {availableShows.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-bold text-gray-300 mb-2">TV Shows Not Yet on Platform ({availableShows.length})</div>
                    <div className="space-y-1">
                      {availableShows.map(s => (
                        <div key={s.id} className="flex justify-between items-center bg-gray-900 rounded px-3 py-1.5 text-sm">
                          <div>
                            <span className="text-white">{s.title}</span>
                            <span className="text-gray-500 text-xs ml-2">{s.formatName} · S{s.seasons} · Q:{s.quality}</span>
                          </div>
                          <button onClick={() => dispatch({ type: 'ADD_TO_CATALOG', contentId: s.id, contentType: 'show' })} className="bg-amber-700 hover:bg-amber-600 text-white text-xs px-2 py-0.5 rounded">
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(inCatalogFilms.length > 0 || inCatalogShows.length > 0) && (
                  <div>
                    <div className="text-sm font-bold text-gray-400 mb-1">On Platform ({inCatalogFilms.length} films, {inCatalogShows.length} shows)</div>
                    <div className="max-h-32 overflow-y-auto">
                      {inCatalogFilms.slice(0, 10).map(f => (
                        <div key={f.id} className="flex justify-between text-xs text-gray-500 py-0.5">
                          <span>{f.title} ({f.genre}, Q:{f.quality})</span>
                          <button onClick={() => dispatch({ type: 'REMOVE_FROM_CATALOG', contentId: f.id, contentType: 'film' })} className="text-red-500 hover:text-red-400">remove</button>
                        </div>
                      ))}
                      {inCatalogFilms.length > 10 && <div className="text-xs text-gray-600">...and {inCatalogFilms.length - 10} more films</div>}
                      {inCatalogShows.map(s => (
                        <div key={s.id} className="flex justify-between text-xs text-gray-500 py-0.5">
                          <span>{s.title} ({s.formatName}, S{s.seasons})</span>
                          <button onClick={() => dispatch({ type: 'REMOVE_FROM_CATALOG', contentId: s.id, contentType: 'show' })} className="text-red-500 hover:text-red-400">remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {notInCatalogFilms.length === 0 && availableShows.length === 0 && (
                  <div className="text-gray-500 text-sm text-center py-2">All your content is on the platform!</div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Rival Streaming Platforms */}
        {platform && (state.rivalStreamers || []).length > 0 && (
          <div className="mb-6">
            <div className="text-lg font-bold text-red-400 mb-2">Competing Platforms</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(state.rivalStreamers || []).map(rs => (
                <div key={rs.name} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <div className="text-white font-bold text-sm">{rs.name}</div>
                  <div className="text-xs text-gray-400">{rs.desc}</div>
                  <div className="text-blue-400 text-sm mt-1">{rs.subscribers >= 1e6 ? `${(rs.subscribers / 1e6).toFixed(0)}M` : `${(rs.subscribers / 1e3).toFixed(0)}K`} subs</div>
                  <div className="text-gray-500 text-xs">{rs.contentCount} titles · Est. {rs.founded}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TV Show Development */}
        <div className="mb-6">
          <div className="text-lg font-bold text-green-400 mb-2">Develop New TV Show</div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            {showrunners.length === 0 ? (
              <div className="text-gray-500 text-sm">No showrunners under contract. Sign one in the Talent tab first.</div>
            ) : (
              <>
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Format</div>
                  <div className="flex flex-wrap gap-1">
                    {TV_FORMATS.map(f => (
                      <button key={f.id} onClick={() => dispatch({ type: 'SET_TV_DEV', field: 'tvDevFormat', value: f.id })} className={`px-2 py-1 rounded text-xs font-bold ${state.tvDevFormat === f.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
                {state.tvDevFormat && (() => {
                  const format = TV_FORMATS.find(f => f.id === state.tvDevFormat);
                  return (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Showrunner</div>
                          <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white" value={state.tvDevShowrunnerId || ''} onChange={e => dispatch({ type: 'SET_TV_DEV', field: 'tvDevShowrunnerId', value: Number(e.target.value) })}>
                            <option value="">Select...</option>
                            {showrunners.map(s => <option key={s.id} value={s.id}>{s.name} ({s.skill}) — {s.trait}</option>)}
                          </select>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Episodes ({format.episodesRange[0]}-{format.episodesRange[1]})</div>
                          <input type="range" min={format.episodesRange[0]} max={format.episodesRange[1]} value={state.tvDevEpisodes || format.episodesRange[0]} onChange={e => dispatch({ type: 'SET_TV_DEV', field: 'tvDevEpisodes', value: Number(e.target.value) })} className="w-full" />
                          <div className="text-xs text-center text-white">{state.tvDevEpisodes || format.episodesRange[0]} episodes</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Budget/Episode</div>
                          <input type="range" min={1} max={15} step={0.5} value={state.tvDevBudgetPerEp || 3} onChange={e => dispatch({ type: 'SET_TV_DEV', field: 'tvDevBudgetPerEp', value: Number(e.target.value) })} className="w-full" />
                          <div className="text-xs text-center text-white">{fmt((state.tvDevBudgetPerEp || 3) * 1e6)}/ep</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Distribution</div>
                          <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white" value={state.tvDevDistribution || 'streaming_exclusive'} onChange={e => dispatch({ type: 'SET_TV_DEV', field: 'tvDevDistribution', value: e.target.value })}>
                            {CONTENT_DISTRIBUTION_OPTIONS.filter(o => !o.filmOnly && (!o.requiresStreaming || state.streamingPlatform)).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            <option value="network">Network TV (no streaming)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                          Total cost: <span className="text-white font-bold">{fmt((state.tvDevEpisodes || format.episodesRange[0]) * (state.tvDevBudgetPerEp || 3) * 1e6)}</span>
                          {' · '}Production: ~{Math.ceil((state.tvDevEpisodes || format.episodesRange[0]) / 3)} months
                        </div>
                        <button onClick={() => dispatch({ type: 'GREENLIGHT_TV' })} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 rounded-lg transition">
                          Greenlight Show
                        </button>
                      </div>
                      {state.errorMsg && <div className="text-red-400 text-sm mt-2">{state.errorMsg}</div>}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>

        {/* Active TV Shows */}
        <div className="mb-6">
          <div className="text-lg font-bold text-amber-400 mb-2">TV Shows ({state.tvShows.length})</div>
          {state.tvShows.length === 0 ? (
            <div className="text-gray-500 text-sm">No TV shows yet. Greenlight one above!</div>
          ) : (
            <div className="space-y-2">
              {state.tvShows.filter(s => s.status !== 'cancelled').map(show => (
                <div key={show.id} className={`bg-gray-800 border rounded-lg p-3 ${show.status === 'airing' ? 'border-green-700' : show.status === 'ended' ? 'border-gray-600' : 'border-yellow-700'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white">{show.title}</div>
                      <div className="text-xs text-gray-400">{show.formatName} · {show.episodes} eps · S{show.currentSeason} · {show.showrunnerName}</div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        show.status === 'airing' ? 'bg-green-600 text-white' :
                        show.status === 'production' ? 'bg-yellow-600 text-white' :
                        show.status === 'development' ? 'bg-blue-600 text-white' :
                        show.status === 'ended' ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'
                      }`}>{show.status.toUpperCase()}</span>
                    </div>
                  </div>
                  {show.quality > 0 && (
                    <div className="flex gap-4 mt-2 text-sm flex-wrap">
                      <span className="text-gray-400">Quality: <span className="text-white">{show.quality}</span></span>
                      <span className="text-gray-400">Viewers: <span className="text-white">{show.viewership >= 1e6 ? `${(show.viewership / 1e6).toFixed(1)}M` : `${(show.viewership / 1e3).toFixed(0)}K`}</span></span>
                      <span className="text-gray-400">Critics: <span className="text-white">{show.criticScore}</span></span>
                      {show.subscriberImpact > 0 && <span className="text-gray-400">Sub Impact: <span className="text-purple-400">+{(show.subscriberImpact / 1e6).toFixed(1)}M</span></span>}
                    </div>
                  )}
                  {show.criticReviews && show.criticReviews.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {show.criticReviews.slice(0, 4).map((r, i) => (
                        <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${r.score >= 70 ? 'bg-green-900 text-green-300' : r.score >= 50 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                          {r.name}: {r.score}
                        </span>
                      ))}
                    </div>
                  )}
                  {show.status === 'airing' && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button onClick={() => dispatch({ type: 'RENEW_SHOW', showId: show.id })} className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1 rounded">
                        Renew S{show.currentSeason + 1}
                      </button>
                      <button onClick={() => dispatch({ type: 'CANCEL_SHOW', showId: show.id })} className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded">
                        Cancel
                      </button>
                      {state.streamingPlatform && (
                        <button onClick={() => dispatch({ type: 'LICENSE_CONTENT_OUT', contentId: show.id, contentType: 'show' })} className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded">
                          License Out
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Licensing */}
        {state.streamingPlatform && (
          <div className="mb-6">
            <div className="text-lg font-bold text-cyan-400 mb-2">Content Licensing</div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-sm font-bold text-gray-300 mb-1">License In (buy content)</div>
                  <button onClick={() => dispatch({ type: 'LICENSE_CONTENT_IN', title: 'Content Package', partner: pick(RIVAL_STREAMERS).name, monthlyFee: randInt(100000, 500000) })} className="bg-cyan-700 hover:bg-cyan-600 text-white text-sm px-3 py-1 rounded w-full">
                    Buy Content Package
                  </button>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-300 mb-1">Windowing Strategy</div>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white" value={state.windowingStrategy || 'exclusive_45'} onChange={e => dispatch({ type: 'SET_WINDOWING', strategy: e.target.value })}>
                    {WINDOWING_OPTIONS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              {(state.licensingDeals || []).length > 0 && (
                <div>
                  <div className="text-sm font-bold text-gray-400 mb-1">Active Deals</div>
                  {(state.licensingDeals || []).map(d => (
                    <div key={d.id} className="flex justify-between text-xs text-gray-400 py-1 border-b border-gray-700">
                      <span>{d.type === 'out' ? '→' : '←'} {d.contentTitle} ({d.partner})</span>
                      <span className={d.type === 'out' ? 'text-green-400' : 'text-red-400'}>{d.type === 'out' ? '+' : '-'}{fmt(d.monthlyFee)}/mo · {d.monthsLeft}mo left</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancelled/Ended Shows */}
        {(cancelledShows.length > 0 || endedShows.length > 0) && (
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1">Completed / Cancelled ({cancelledShows.length + endedShows.length})</div>
            {[...endedShows, ...cancelledShows].map(show => (
              <div key={show.id} className="text-xs text-gray-500 py-1">{show.title} — {show.seasons}S · Q:{show.quality} · {show.status}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderScreening = () => {
    const playerFilms = (state.allFilmHistory || []).filter(f => !f.isRival);

    let sortedFilms = [...playerFilms];
    if (screeningSortBy === 'year') sortedFilms.sort((a, b) => (b.releasedYear || 0) - (a.releasedYear || 0) || (b.releasedMonth || 0) - (a.releasedMonth || 0));
    else if (screeningSortBy === 'quality') sortedFilms.sort((a, b) => (b.quality || 0) - (a.quality || 0));
    else if (screeningSortBy === 'box office') sortedFilms.sort((a, b) => (b.totalGross || 0) - (a.totalGross || 0));
    else if (screeningSortBy === 'awards') sortedFilms.sort((a, b) => (state.awards.filter(aw => aw.filmId === b.id).length || 0) - (state.awards.filter(aw => aw.filmId === a.id).length || 0));

    const totalGross = playerFilms.reduce((s, f) => s + (f.totalGross || 0), 0);
    const totalAwards = state.awards.filter(a => playerFilms.some(f => f.id === a.filmId)).length;
    const avgQuality = playerFilms.length > 0 ? Math.round(playerFilms.reduce((s, f) => s + (f.quality || 0), 0) / playerFilms.length) : 0;
    const bestFilm = playerFilms.length > 0 ? playerFilms.reduce((best, f) => (f.quality || 0) > (best.quality || 0) ? f : best) : null;
    const worstFilm = playerFilms.length > 0 ? playerFilms.reduce((worst, f) => (f.quality || 0) < (worst.quality || 0) ? f : worst) : null;

    return (
      <div className="space-y-6">
        {/* Studio Stats */}
        <div>
          <div className="text-white font-bold text-lg mb-3">Your Legacy</div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Total Films</div>
              <div className="text-white font-bold text-xl">{playerFilms.length}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Total Gross</div>
              <div className="text-green-400 font-bold text-lg">{fmt(totalGross)}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Awards Won</div>
              <div className="text-amber-400 font-bold text-xl">{totalAwards}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Avg Quality</div>
              <div className="text-blue-400 font-bold text-lg">{avgQuality}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-xs">Studios</div>
              <div className="text-white font-bold text-lg">{new Set(playerFilms.map(f => f.studio)).size}</div>
            </div>
          </div>
        </div>

        {/* Best/Worst Films */}
        {bestFilm && worstFilm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <div className="text-green-400 font-bold text-sm mb-2">Best Film</div>
              <div className="text-white font-bold">{bestFilm.title}</div>
              <div className="text-gray-400 text-xs">Q: {bestFilm.quality} | {fmt(bestFilm.totalGross)} gross</div>
            </div>
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <div className="text-red-400 font-bold text-sm mb-2">Lowest Quality</div>
              <div className="text-white font-bold">{worstFilm.title}</div>
              <div className="text-gray-400 text-xs">Q: {worstFilm.quality} | {fmt(worstFilm.totalGross)} gross</div>
            </div>
          </div>
        )}

        {/* Filmography */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-white font-bold text-lg">Filmography</div>
            <select value={screeningSortBy} onChange={(e) => setScreeningSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1 rounded">
              <option value="year">Sort by: Year</option>
              <option value="quality">Sort by: Quality</option>
              <option value="box office">Sort by: Box Office</option>
              <option value="awards">Sort by: Awards</option>
            </select>
          </div>

          {playerFilms.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-400 text-sm">You haven't released any films yet!</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {sortedFilms.map((film, i) => {
                const filmAwards = state.awards.filter(a => a.filmId === film.id).length;
                return (
                  <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-white font-bold">{film.title}</div>
                        <div className="text-gray-400 text-xs">{film.genre}{film.genre2 ? ` / ${film.genre2}` : ''} · {film.releasedYear}</div>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <div className={`font-bold ${film.quality >= 80 ? 'text-green-400' : film.quality >= 60 ? 'text-yellow-400' : film.quality >= 40 ? 'text-orange-400' : 'text-red-400'}`}>Q: {film.quality}</div>
                        <div className="text-green-400">{fmt(film.totalGross)}</div>
                        {filmAwards > 0 && <div className="text-amber-400">{filmAwards} award{filmAwards > 1 ? 's' : ''}</div>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Budget: {fmt(film.budget)} | <span className={film.criticScore >= 80 ? 'text-green-400' : film.criticScore >= 50 ? 'text-amber-400' : 'text-red-400'}>Critics: {film.criticScore || '?'}</span> | <span className={film.audienceScore >= 80 ? 'text-green-400' : film.audienceScore >= 50 ? 'text-amber-400' : 'text-red-400'}>Audience: {film.audienceScore || '?'}</span>{film.isSleeper ? ' | SLEEPER HIT' : ''}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Awards ceremony modal — now shows multiple real award shows
  const renderCeremony = () => {
    if (!state.showCeremony || !state.pendingCeremony) return null;
    const c = state.pendingCeremony;
    const shows = c.shows || [];
    const totalPlayerWins = shows.reduce((sum, s) => sum + s.categories.filter(cat => !cat.isRivalWin && !s.isNegative).length, 0);
    const totalCats = shows.reduce((sum, s) => sum + (s.isNegative ? 0 : s.categories.length), 0);
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-gray-900 border-2 border-amber-500 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="text-center mb-6">
            <div className="text-amber-400 text-4xl font-bold mb-1">Awards Season {c.year}</div>
            <div className="text-gray-400">{shows.length} ceremony{shows.length > 1 ? 'ies' : ''} this month</div>
          </div>

          {shows.map((show, si) => (
            <div key={si} className={`mb-6 ${si > 0 ? 'border-t border-gray-700 pt-6' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{show.icon}</span>
                <div>
                  <div className={`font-bold text-xl ${show.isNegative ? 'text-red-400' : 'text-amber-400'}`}>{show.showName}</div>
                  <div className="text-xs text-gray-500">{show.year} · {show.categories.length} categories</div>
                </div>
                <div className="ml-auto text-right">
                  {!show.isNegative && <div className="text-amber-300 font-bold text-sm">{show.categories.filter(cat => !cat.isRivalWin).length} wins</div>}
                  {show.isNegative && <div className="text-red-400 font-bold text-sm">{show.categories.filter(cat => !cat.isRivalWin).length} "wins"</div>}
                </div>
              </div>

              <div className="space-y-3">
                {show.categories.map((cat, ci) => (
                  <div key={ci} className={`${show.isNegative ? 'bg-red-900/10 border-red-800' : 'bg-gray-800 border-gray-700'} border rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className={`font-bold text-sm ${show.isNegative ? 'text-red-400' : 'text-amber-400'}`}>{cat.name}</span>
                    </div>
                    <div className="space-y-1">
                      {cat.nominees.map((nom, ni) => (
                        <div key={ni} className={`flex justify-between items-center px-3 py-1.5 rounded-lg text-sm ${nom.isWinner
                          ? (show.isNegative
                            ? (nom.isRival ? 'bg-gray-700/50' : 'bg-red-900/30 border border-red-500')
                            : (nom.isRival ? 'bg-blue-900/20 border border-blue-500' : 'bg-amber-500/20 border border-amber-500'))
                          : 'bg-gray-700/30'}`}>
                          <div className="flex items-center gap-2">
                            {nom.isWinner && <span className={`font-bold text-xs ${show.isNegative ? 'text-red-400' : (nom.isRival ? 'text-blue-400' : 'text-amber-400')}`}>
                              {show.isNegative ? '💩' : (nom.isRival ? 'RIVAL' : '★ WINNER')}
                            </span>}
                            <div>
                              <span className={`font-bold text-xs ${nom.isWinner ? (show.isNegative ? 'text-red-300' : (nom.isRival ? 'text-blue-300' : 'text-amber-300')) : 'text-white'}`}>"{nom.title}"</span>
                              <span className="text-xs text-gray-500 ml-2">{nom.studio}{nom.director ? ` · ${nom.director}` : ''}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">Q:{nom.quality}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center mt-6 border-t border-gray-700 pt-4">
            <div className="text-amber-400 font-bold text-lg mb-1">{totalPlayerWins} of {totalCats} awards won</div>
            <div className="text-gray-500 text-xs mb-3">across {shows.filter(s => !s.isNegative).length} ceremonies</div>
            <button onClick={() => dispatch({ type: 'DISMISS_CEREMONY' })}
              className={`${studioColor.bg} hover:opacity-90 text-gray-900 font-bold px-8 py-3 rounded-lg text-lg transition`}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  // FEATURE 3: Year-End Summary Modal
  // ==================== TURN SUMMARY PANEL ====================
  const renderTurnSummary = () => {
    if (!state.showTurnSummary || !state.turnSummary) return null;
    const ts = state.turnSummary;
    const sections = ts.sections || {};
    const expanded = state.turnSummaryExpanded || {};

    const sectionColorMap = {
      green: { badge: 'bg-green-900 text-green-400', pill: 'bg-green-900 text-green-300' },
      blue: { badge: 'bg-blue-900 text-blue-400', pill: 'bg-blue-900 text-blue-300' },
      purple: { badge: 'bg-purple-900 text-purple-400', pill: 'bg-purple-900 text-purple-300' },
      amber: { badge: 'bg-amber-900 text-amber-400', pill: 'bg-amber-900 text-amber-300' },
      red: { badge: 'bg-red-900 text-red-400', pill: 'bg-red-900 text-red-300' },
      cyan: { badge: 'bg-cyan-900 text-cyan-400', pill: 'bg-cyan-900 text-cyan-300' },
      indigo: { badge: 'bg-indigo-900 text-indigo-400', pill: 'bg-indigo-900 text-indigo-300' },
    };

    const summaryBlocks = [
      { id: 'boxOffice', icon: '📊', title: 'Box Office & Releases', data: sections.boxOffice || [], color: 'green' },
      { id: 'production', icon: '🎬', title: 'Production Updates', data: sections.production || [], color: 'blue' },
      { id: 'talent', icon: '🎭', title: 'Talent News', data: sections.talent || [], color: 'purple' },
      { id: 'market', icon: '📈', title: 'Market & Finance', data: sections.market || [], color: 'amber' },
      { id: 'rivals', icon: '🏢', title: 'Rival Activity', data: sections.rivals || [], color: 'red' },
      { id: 'intelligence', icon: '🕵️', title: 'Intelligence', data: sections.intelligence || [], color: 'cyan' },
      { id: 'streaming', icon: '📺', title: 'Streaming', data: sections.streaming || [], color: 'indigo' },
    ].filter(s => s.data.length > 0);

    const yearSummary = sections.yearSummary || null;

    const renderSectionContent = (section) => {
      if (section.id === 'boxOffice') {
        return section.data.map((film, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
            <div>
              <span className="text-white font-bold text-sm">{film.title}</span>
              <span className="text-gray-500 text-xs ml-2">{film.genre}</span>
              {film.isIP && <span className="text-purple-400 text-xs ml-1">[IP]</span>}
              {film.isSleeper && <span className="text-amber-400 text-xs ml-1">[SLEEPER]</span>}
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className={`text-sm font-bold ${(film.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fmt(film.totalGross || 0)}
              </div>
              <div className="text-xs text-gray-500">
                C:{film.criticScore || '?'} A:{film.audienceScore || '?'} | P:{fmt(film.profit || 0)}
              </div>
            </div>
          </div>
        ));
      }
      // Generic rendering for all other sections
      return section.data.map((item, i) => (
        <div key={i} className="py-1.5 border-b border-gray-800 last:border-0 text-sm text-gray-300">
          {typeof item === 'string' ? item : (item.text || item.title || item.event || item.update || JSON.stringify(item))}
        </div>
      ));
    };

    return (
      <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Sticky header */}
          <div className="flex-shrink-0 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
            <div>
              <div className="text-white font-bold text-xl">Turn Report</div>
              <div className="text-gray-400 text-sm">{MONTH_NAMES[(ts.month || 1) - 1]} {ts.year} — Turn {ts.turnNum}</div>
            </div>
            <button onClick={() => dispatch({ type: 'DISMISS_TURN_SUMMARY' })}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2 rounded-lg transition text-sm">
              Continue
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {/* Year Summary Banner */}
            {yearSummary && (
              <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/10 border border-amber-700/40 rounded-lg p-4">
                <div className="text-amber-400 font-bold text-lg mb-3">{yearSummary.year} Year in Review</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-gray-400 text-xs">Films</div>
                    <div className="text-white font-bold text-lg">{yearSummary.filmsReleased || 0}</div>
                  </div>
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-gray-400 text-xs">Total Gross</div>
                    <div className="text-green-400 font-bold text-lg">{fmt(yearSummary.totalGross || 0)}</div>
                  </div>
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-gray-400 text-xs">Awards</div>
                    <div className="text-amber-400 font-bold text-lg">{yearSummary.awardsWon || 0}</div>
                  </div>
                  <div className="bg-black/30 rounded p-2 text-center">
                    <div className="text-gray-400 text-xs">Cash Change</div>
                    <div className={`font-bold text-lg ${(yearSummary.cashChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(yearSummary.cashChange || 0) >= 0 ? '+' : ''}{fmt(yearSummary.cashChange || 0)}
                    </div>
                  </div>
                </div>
                {yearSummary.bestFilm && (
                  <div className="mt-2 text-xs text-gray-400">Biggest Hit: <span className="text-green-400 font-bold">"{yearSummary.bestFilm.title}" — {fmt(yearSummary.bestFilm.gross)}</span></div>
                )}
                {yearSummary.worstFilm && yearSummary.worstFilm.quality < 50 && (
                  <div className="text-xs text-gray-400">Biggest Flop: <span className="text-red-400">"{yearSummary.worstFilm.title}" — Q:{yearSummary.worstFilm.quality}</span></div>
                )}
              </div>
            )}

            {/* Quick summary pills */}
            {summaryBlocks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {summaryBlocks.map(s => (
                  <span key={s.id} className={`text-xs px-2 py-1 rounded-full font-bold ${sectionColorMap[s.color]?.pill || 'bg-gray-800 text-gray-400'}`}>
                    {s.icon} {s.title}: {s.data.length}
                  </span>
                ))}
              </div>
            )}

            {/* Collapsible sections */}
            {summaryBlocks.length === 0 && !yearSummary && (
              <div className="text-gray-500 text-center py-8">A quiet month. Nothing major to report.</div>
            )}

            {summaryBlocks.map(section => {
              const isExpanded = expanded[section.id] || false;
              const colors = sectionColorMap[section.color] || sectionColorMap.amber;
              return (
                <div key={section.id} className="border border-gray-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_SUMMARY_SECTION', section: section.id })}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span>{section.icon}</span>
                      <span className="text-white font-bold text-sm">{section.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${colors.badge}`}>{section.data.length}</span>
                    </div>
                    <span className="text-gray-500 text-sm">{isExpanded ? '▼' : '▶'}</span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 py-2 bg-gray-900/50">
                      {renderSectionContent(section)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky footer */}
          <div className="flex-shrink-0 border-t border-gray-700 px-6 py-3 flex justify-end">
            <button onClick={() => dispatch({ type: 'DISMISS_TURN_SUMMARY' })}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-2.5 rounded-lg transition">
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Year summary is now merged into the Turn Summary panel
  const renderYearSummary = () => null;

  return (
    <div className="w-full min-h-screen bg-gray-950 text-white">
      <style>{`
        @keyframes flashGreen { 0% { color: #4ade80; } 100% { color: inherit; } }
        @keyframes flashRed { 0% { color: #f87171; } 100% { color: inherit; } }
        .anim-flash-green { animation: flashGreen 0.6s ease-out; }
        .anim-flash-red { animation: flashRed 0.6s ease-out; }
      `}</style>
      {renderCeremony()}
      {state.celebration && (
        <ConfettiOverlay celebration={state.celebration} onDone={() => dispatch({ type: 'CLEAR_CELEBRATION' })} />
      )}
      {state.activeBidding && (
        <BiddingWarModal bidding={state.activeBidding} cash={state.cash}
          onRaise={(amount) => dispatch({ type: 'RAISE_BID', amount })}
          onWalk={() => dispatch({ type: 'WALK_AWAY_BID' })}
          onClose={() => dispatch({ type: 'CLOSE_BIDDING' })} />
      )}
      {/* Newspaper — max 1 per turn, shows BEFORE turn summary for spotlight moment */}
      {state.newspaperQueue?.length > 0 && !state.showCeremony && (
        <NewspaperModal
          newspaper={state.newspaperQueue[0]}
          queueLength={0}
          onDismiss={() => dispatch({ type: 'DISMISS_NEWSPAPER' })}
          onSkipAll={() => dispatch({ type: 'DISMISS_NEWSPAPER' })}
        />
      )}
      {/* Turn Summary — shows after newspaper is dismissed */}
      {!state.showCeremony && !(state.newspaperQueue?.length > 0) && renderTurnSummary()}
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div>
            <div className={`text-3xl font-bold ${studioColor.accent}`}>{state.studioName}</div>
            <div className="text-sm text-gray-400">
              {MONTH_NAMES[(state.month || 1) - 1]} {state.year} · {era} · Cash: <span className={state.cash >= 0 ? 'text-green-400' : 'text-red-400'}><AnimatedNumber value={state.cash} format={fmt} /></span>
              {' · '}<span className="text-purple-400">{legacyBench.name}</span>
              <span className="text-gray-500"> ({currentLegacy.toLocaleString()} pts)</span>
            </div>
            {state.studioMotto && <div className="text-xs text-gray-500 italic">"{state.studioMotto}"</div>}
            {state.year >= 2190 && <div className="text-xs text-red-400">{(2200 - state.year) * 12 + (12 - state.month)} months until legacy is sealed!</div>}
          </div>
          <button onClick={() => dispatch({ type: 'END_TURN' })}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-lg text-lg transition shadow-lg shadow-green-900/30">
            END TURN →
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {tabs.map(t => {
            const badge = (state.tabBadges || {})[t] || 0;
            return (
              <button key={t} onClick={() => { setTab(t); if (badge > 0) dispatch({ type: 'CLEAR_TAB_BADGE', tab: t }); }}
                className={`relative px-3 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${tab === t ? `${studioColor.bg} text-gray-900` : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                {tabIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                {badge > 0 && tab !== t && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center font-bold px-1">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 min-h-[400px]">
          {tab === 'dashboard' && renderDashboard()}
          {tab === 'develop' && renderDevelop()}
          {tab === 'production' && renderProduction()}
          {tab === 'release' && renderRelease()}
          {tab === 'talent' && renderTalent()}
          {tab === 'studio' && renderStudio()}
          {tab === 'finance' && renderFinance()}
          {tab === 'market' && renderMarket()}
          {tab === 'streaming' && renderStreaming()}
          {tab === 'press' && renderPress()}
          {tab === 'academy' && renderAcademy()}
          {tab === 'catalog' && renderCatalog()}
          {tab === 'partners' && renderPartners()}
          {tab === 'screening' && renderScreening()}
        </div>
      </div>
    </div>
  );
}

