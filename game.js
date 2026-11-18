(function(){
'use strict';
const registry=Object.create(null),cache=Object.create(null);
function require(name){
if(name==='react')return window.React;
if(name==='react-dom/client')return {createRoot:(el)=>({render:(tree)=>window.ReactDOM.render(tree,el)})};
if(name==='react-dom')return window.ReactDOM;
name=name.replace(/\.(tsx?|jsx?)$/,'');
if(!registry[name])throw new Error('Missing bundled module: '+name);
if(cache[name])return cache[name].exports;
const module={exports:{}};cache[name]=module;registry[name](module,module.exports,require);return module.exports;
}
registry["./App"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const Story_1 = require("./Story");
const CrewProfile_1 = require("./CrewProfile");
const crewProfiles_1 = require("./crewProfiles");
const ColonyMap_1 = require("./ColonyMap");
const VictoryFilm_1 = require("./VictoryFilm");
const AudioPanel_1 = require("./AudioPanel");
const gameAudio_1 = require("./gameAudio");
const nasaResources_1 = require("./nasaResources");
const game_1 = require("./game");
const stats = [
    { key: 'oxygen', label: 'OXYGEN', icon: '◉', unit: 'O₂' },
    { key: 'water', label: 'WATER', icon: '◈', unit: 'L' },
    { key: 'food', label: 'FOOD', icon: '✿', unit: 'kg' },
    { key: 'energy', label: 'POWER', icon: 'ϟ', unit: 'kWh' },
    { key: 'metal', label: 'SCRAP', icon: '⬡', unit: 'units' },
];
function ResourceTile({ stat, amount, delta }) {
    return React.createElement("div", { className: `v4-resource ${amount < 18 && stat.key !== 'metal' ? 'v4-danger' : ''}`, title: `Daily stored-resource change before manual collection: ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} · Maximum storage: ${game_1.storageCaps[stat.key]}` },
        React.createElement("span", { className: `v4-resource-icon res-${stat.key}` }, stat.icon),
        React.createElement("span", { className: "v4-resource-title" },
            stat.label,
            React.createElement("small", null, stat.unit)),
        React.createElement("span", { className: "v4-resource-number" }, Math.round(amount)),
        React.createElement("span", { className: `v4-resource-change ${delta >= 0 ? 'positive' : 'negative'}` },
            delta > 0 ? '+' : '',
            delta.toFixed(1),
            "/sol"));
}
function App() {
    const [game, setGame] = (0, react_1.useState)(() => (0, game_1.restoreState)() || (0, game_1.startingState)());
    const [hasSave, setHasSave] = (0, react_1.useState)(() => Boolean((0, game_1.restoreState)()));
    const [screen, setScreen] = (0, react_1.useState)('story');
    const [buildType, setBuildType] = (0, react_1.useState)(null);
    const [selected, setSelected] = (0, react_1.useState)(null);
    const [moveId, setMoveId] = (0, react_1.useState)(null);
    const [atlas, setAtlas] = (0, react_1.useState)(false);
    const [confirmRestart, setConfirmRestart] = (0, react_1.useState)(false);
    const [selectedCrew, setSelectedCrew] = (0, react_1.useState)(null);
    const closeCrewProfile = (0, react_1.useCallback)(() => setSelectedCrew(null), []);
    const selectCrewProfile = (0, react_1.useCallback)((name) => setSelectedCrew(name), []);
    const [showHelp, setShowHelp] = (0, react_1.useState)(true);
    const [victoryPlayed, setVictoryPlayed] = (0, react_1.useState)(() => (0, game_1.restoreState)()?.status === 'won');
    const [buildGroup, setBuildGroup] = (0, react_1.useState)('Life Support');
    const flow = (0, react_1.useMemo)(() => (0, game_1.getProduction)(game), [game]);
    const realDailyChange = (0, react_1.useMemo)(() => {
        const alive = game.crew.filter(c => c.health > 0).length;
        const greenhouseWater = game.buildings.filter(b => b.type === 'greenhouse').reduce((total, b) => total + ((0, game_1.levelMultiplier)(b.level)), 0);
        return { ...(0, game_1.getProduction)(game), oxygen: -alive * 1.2, water: -(alive * .85 + greenhouseWater) };
    }, [game]);
    const stored = (0, react_1.useMemo)(() => (0, game_1.getStoredTotal)(game), [game]);
    const quest = (0, game_1.getDailyQuest)(game);
    const todayResearch = (0, nasaResources_1.researchForQuest)(quest.kind);
    const questDone = (0, game_1.isQuestComplete)(game);
    const crewAlive = game.crew.filter(c => c.health > 0).length;
    const profileMember = selectedCrew ? game.crew.find(c => c.name === selectedCrew) : undefined;
    const selectedBuilding = game.buildings.find(b => b.id === selected);
    const selectedUpgrade = selectedBuilding ? (0, game_1.activeUpgrade)(game, selectedBuilding.id) : undefined;
    const nextEngineer = (0, game_1.availableEngineer)(game);
    const coreBaseOnline = game.buildings.some(b => b.type === 'oxygen') && game.buildings.some(b => b.type === 'recycler') && game.buildings.some(b => b.type === 'solar');
    const nextNeed = flow.oxygen < 0 ? 'oxygen' : flow.water < 0 ? 'recycler' : flow.food < 0 ? 'greenhouse' : flow.energy < 0 ? 'solar' : null;
    const progress = Math.min(100, ((game.sol - 1) / (game_1.END_SOL - 1)) * 100);
    (0, react_1.useEffect)(() => { gameAudio_1.gameAudio.setGameActive(screen === 'game' && game.status === 'playing'); }, [screen, game.status]);
    (0, react_1.useEffect)(() => {
        if (screen === 'game') {
            try {
                localStorage.setItem(game_1.saveKey, JSON.stringify(game));
                setHasSave(true);
            }
            catch { /* Browser storage can be disabled. */ }
        }
    }, [game, screen]);
    (0, react_1.useEffect)(() => {
        const save = () => { if (screen === 'game') {
            try {
                localStorage.setItem(game_1.saveKey, JSON.stringify(game));
            }
            catch { /* storage unavailable */ }
        } };
        const onVisibility = () => { if (document.visibilityState === 'hidden')
            save(); };
        window.addEventListener('pagehide', save);
        document.addEventListener('visibilitychange', onVisibility);
        return () => { window.removeEventListener('pagehide', save); document.removeEventListener('visibilitychange', onVisibility); };
    }, [game, screen]);
    const newMission = () => { setSelectedCrew(null); gameAudio_1.gameAudio.play('start', true); setVictoryPlayed(false); setGame((0, game_1.startingState)()); setBuildType(null); setSelected(null); setMoveId(null); setAtlas(false); setConfirmRestart(false); setScreen('game'); };
    const resume = () => { setSelectedCrew(null); gameAudio_1.gameAudio.play('start', true); setVictoryPlayed(false); setGame((0, game_1.restoreState)() || (0, game_1.startingState)()); setBuildType(null); setSelected(null); setMoveId(null); setScreen('game'); };
    const selectTile = (x, y) => {
        if (moveId !== null) {
            const next = (0, game_1.moveBuilding)(game, moveId, x, y);
            if (next !== game) {
                gameAudio_1.gameAudio.play('move');
                setGame(next);
                setSelected(moveId);
                setMoveId(null);
            }
            else
                gameAudio_1.gameAudio.play('error');
            return;
        }
        if (!buildType)
            return;
        const next = (0, game_1.placeBuilding)(game, buildType, x, y);
        if (next.buildings.length > game.buildings.length) {
            gameAudio_1.gameAudio.play('build');
            setGame(next);
            setSelected(next.nextId - 1);
            setBuildType(null);
        }
        else if (next !== game) {
            gameAudio_1.gameAudio.play('warning');
            setGame(next);
        }
        else
            gameAudio_1.gameAudio.play('error');
    };
    const inspect = (b) => { gameAudio_1.gameAudio.play('select'); setBuildType(null); setMoveId(null); setSelected(b.id); };
    const dragMove = (id, x, y) => { const next = (0, game_1.moveBuilding)(game, id, x, y); if (next !== game) {
        gameAudio_1.gameAudio.play('move');
        setGame(next);
    }
    else
        gameAudio_1.gameAudio.play('error'); setSelected(id); setMoveId(null); setBuildType(null); };
    const restart = () => { try {
        localStorage.removeItem(game_1.saveKey);
        localStorage.removeItem('ares-first-colony-v5');
    }
    catch { } newMission(); };
    const dismissSelection = () => { setBuildType(null); setMoveId(null); setSelected(null); };
    // Always show the prologue on launch, even when a saved colony exists.
    // BEGIN plays the cinematic, then restores saved progress. REPLAY INTRO never resets the game.
    const replayIntro = () => {
        try {
            localStorage.setItem(game_1.saveKey, JSON.stringify(game));
        }
        catch { /* In-memory state remains intact. */ }
        gameAudio_1.gameAudio.setGameActive(false);
        setScreen('story');
    };
    if (screen === 'story')
        return React.createElement(Story_1.Story, { onStart: hasSave ? resume : newMission, hasSave: hasSave, onResume: resume });
    return React.createElement("div", { className: "v4-root", onPointerDownCapture: () => gameAudio_1.gameAudio.unlock(), onKeyDownCapture: () => gameAudio_1.gameAudio.unlock() },
        React.createElement("header", { className: "v4-header" },
            React.createElement("div", { className: "v4-location" },
                React.createElement("span", { className: "v4-dot" }),
                " JEZERO CRATER ",
                React.createElement("span", null, " / "),
                " FICTIONAL HUMAN OUTPOST"),
            React.createElement("div", { className: "v4-brand" },
                React.createElement("span", { className: "v4-mark" }, "A"),
                React.createElement("div", null,
                    React.createElement("b", null,
                        "ARES: ",
                        React.createElement("strong", null, "FIRST COLONY")),
                    React.createElement("small", null, "EDITION IX \u00B7 CREW DOSSIERS"))),
            React.createElement("div", { className: "v4-header-actions" },
                React.createElement("button", { type: "button", onClick: replayIntro }, "\u25B6 REPLAY INTRO"),
                React.createElement("button", { type: "button", onClick: () => { gameAudio_1.gameAudio.play('select'); setAtlas(true); } }, "\u25C8 SCIENCE ATLAS"),
                React.createElement("button", { type: "button", onClick: () => { try {
                        localStorage.setItem(game_1.saveKey, JSON.stringify(game));
                        gameAudio_1.gameAudio.play('save');
                    }
                    catch {
                        gameAudio_1.gameAudio.play('error');
                    } } }, "\u2726 SAVE"),
                React.createElement("button", { type: "button", onClick: () => { gameAudio_1.gameAudio.play('select'); setConfirmRestart(true); } }, "\u21BB RESTART"),
                React.createElement("div", { className: "v4-sol" },
                    "SOL ",
                    React.createElement("b", null, game.sol),
                    " ",
                    React.createElement("small", null,
                        "/ ",
                        game_1.END_SOL)))),
        React.createElement("div", { className: "v7-audio-strip" },
            React.createElement("span", null, "\u266A COLONY SOUNDS"),
            React.createElement(AudioPanel_1.AudioPanel, null)),
        React.createElement("section", { className: "v4-stats", "aria-label": "Current resources" }, stats.map(stat => React.createElement(ResourceTile, { key: stat.key, stat: stat, amount: game.resources[stat.key], delta: realDailyChange[stat.key] }))),
        React.createElement("div", { className: "v4-layout" },
            React.createElement("aside", { className: "v4-left" },
                React.createElement("section", { className: "v4-panel" },
                    React.createElement("div", { className: "v4-panel-top" },
                        React.createElement("b", null, "YOUR MISSION"),
                        React.createElement("span", null, "01 / ARES")),
                    React.createElement("div", { className: "v4-objective" },
                        React.createElement("span", { className: "v4-kicker" }, "ONE SIMPLE GOAL"),
                        React.createElement("h2", null,
                            "HOLD THE LINE.",
                            React.createElement("br", null),
                            React.createElement("em", null, "SURVIVE.")),
                        React.createElement("p", null, "Collect oxygen and water, protect your crew from shortages, and survive 30 sols."),
                        React.createElement("div", { className: "v4-track" },
                            React.createElement("span", { style: { width: `${progress}%` } })),
                        React.createElement("small", null,
                            game.sol,
                            " / ",
                            game_1.END_SOL,
                            " sols survived")),
                    React.createElement("div", { className: "v4-checks" },
                        React.createElement("div", { className: coreBaseOnline ? 'checked' : '' },
                            React.createElement("span", null, coreBaseOnline ? '✓' : '1'),
                            React.createElement("p", null, "Keep the core base online")),
                        React.createElement("div", { className: crewAlive >= 4 ? 'checked' : '' },
                            React.createElement("span", null, crewAlive >= 4 ? '✓' : '2'),
                            React.createElement("p", null, "Keep the crew operational")),
                        React.createElement("div", { className: game.sol >= game_1.END_SOL ? 'checked' : '' },
                            React.createElement("span", null, game.sol >= game_1.END_SOL ? '✓' : '3'),
                            React.createElement("p", null, "Survive until Sol 30")))),
                React.createElement("section", { className: "v4-panel v4-crew-panel" },
                    React.createElement("div", { className: "v4-panel-top" },
                        React.createElement("b", null, "THE SURVIVORS"),
                        React.createElement("span", null,
                            crewAlive,
                            " / 6 AWAKE")),
                    React.createElement("div", { className: "v4-crew-list" }, game.crew.map((member, i) => React.createElement("div", { className: `v4-crew ${i === 0 ? 'v4-captain' : ''}`, key: member.name },
                        React.createElement("button", { type: "button", className: "v4-portrait v4-portrait-button", "aria-label": `View ${member.name}'s biography, heart rate and anxiety`, title: `Open ${member.name}'s profile`, onClick: () => { gameAudio_1.gameAudio.play('select'); selectCrewProfile(member.name); } },
                            React.createElement("img", { src: (0, crewProfiles_1.getCrewDossier)(member)?.portrait ?? 'assets/crew/astronaut.png', alt: `${member.name} profile portrait` })),
                        React.createElement("div", { className: "v4-crew-info" },
                            React.createElement("b", null,
                                React.createElement("button", { type: "button", className: "v9-crew-name", onClick: () => { gameAudio_1.gameAudio.play('select'); selectCrewProfile(member.name); }, title: `Open ${member.name}'s profile` }, member.name),
                                i === 0 && React.createElement("span", { className: "v4-crown" }, "\u2605")),
                            React.createElement("small", null, member.role),
                            game.upgradeJobs.some(job => job.workerName === member.name) && React.createElement("small", { className: "v8-crew-busy" },
                                "\u2692 ENGINEERING \u00B7 ",
                                game_1.catalog[game.buildings.find(b => b.id === game.upgradeJobs.find(job => job.workerName === member.name)?.buildingId)?.type || 'ark'].title),
                            React.createElement("div", { className: "v4-health" },
                                React.createElement("span", { style: { width: `${member.health}%`, background: member.health > 45 ? '#80d9ac' : '#e58a69' } }))),
                        React.createElement("span", { className: "v4-health-label" },
                            Math.round(member.health),
                            "%")))),
                    React.createElement("p", { className: "v4-lore v9-profile-hint" }, "\u2197 Click any astronaut portrait to open their personal dossier, heart rate, and anxiety monitor."))),
            React.createElement("main", { className: "v4-center" },
                React.createElement("div", { className: "v4-map-heading" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "v4-kicker" }, "COMMANDER WESO / SURFACE CONTROL"),
                        React.createElement("h1", null, "THE RED FRONTIER"),
                        React.createElement("p", null, "An expanded base, working life support, and astronauts moving between facilities.")),
                    React.createElement("span", { className: `v4-weather ${game.dustDays ? 'is-storm' : ''}` },
                        "\u25CF ",
                        game.dustDays ? `DUST STORM · ${game.dustDays} SOLS` : 'SURFACE STABLE')),
                React.createElement("section", { className: "v6-daily-mission", "aria-label": "Daily mission for this sol" },
                    React.createElement("div", { className: "v6-daily-heading" },
                        React.createElement("span", null,
                            "DAILY QUEST \u00B7 SOL ",
                            game.sol,
                            " / ",
                            game_1.END_SOL),
                        React.createElement("span", { className: questDone ? 'v6-done' : '' }, questDone ? '✓ COMPLETED' : 'NEW OBJECTIVE')),
                    React.createElement("div", { className: "v6-daily-body" },
                        React.createElement("div", null,
                            React.createElement("h2", null, quest.title),
                            React.createElement("p", null, quest.detail)),
                        React.createElement("button", { type: "button", disabled: questDone || game.status !== 'playing' || !!game.pendingCrisis, onClick: () => { const next = (0, game_1.completeDailyMission)(game); if (next !== game) {
                                setGame(next);
                                gameAudio_1.gameAudio.play('quest');
                            }
                            else
                                gameAudio_1.gameAudio.play('error'); } }, questDone ? '✓ DONE' : 'COMPLETE TASK')),
                    React.createElement("small", null, "One new optional mission every sol, including Sol 30. Progress saves automatically.")),
                React.createElement("section", { className: "v6-nasa-insight", "aria-label": "NASA or space agency research behind today\u2019s mission" },
                    React.createElement("span", { className: "v4-kicker" },
                        "RESEARCH BEHIND THIS SOL \u00B7 ",
                        todayResearch.agency),
                    React.createElement("strong", null, todayResearch.name),
                    React.createElement("p", null, todayResearch.evidence),
                    React.createElement("p", null,
                        React.createElement("b", null, "In this game:"),
                        " ",
                        todayResearch.connection),
                    React.createElement("div", null,
                        React.createElement("a", { href: todayResearch.url, target: "_blank", rel: "noopener noreferrer" }, "VIEW OFFICIAL SOURCE \u2197"),
                        React.createElement("button", { type: "button", onClick: () => setAtlas(true) }, "ALL RESEARCH SOURCES")),
                    React.createElement("small", null, "Published science provides context; our resource rates and health points are fictional.")),
                React.createElement("section", { className: "v6-supply-station", "aria-label": "Collect oxygen and water from your facilities" },
                    React.createElement("div", null,
                        React.createElement("b", null, "RESOURCE COLLECTION"),
                        React.createElement("small", null, "Generators store supplies after every sol. Bring them into colony storage.")),
                    React.createElement("span", null,
                        "O\u2082 READY ",
                        React.createElement("strong", null, Math.round(stored.oxygen))),
                    React.createElement("span", null,
                        "WATER READY ",
                        React.createElement("strong", null, Math.round(stored.water))),
                    React.createElement("button", { type: "button", onClick: () => { const next = (0, game_1.collectAll)(game); if (next !== game) {
                            setGame(next);
                            gameAudio_1.gameAudio.play('collect');
                        }
                        else
                            gameAudio_1.gameAudio.play('error'); }, disabled: (stored.oxygen + stored.water) <= 0 || game.status !== 'playing' || !!game.pendingCrisis }, "COLLECT ALL \u21A7")),
                React.createElement("div", { className: "v4-map-frame" },
                    React.createElement(ColonyMap_1.ColonyMap, { state: game, buildType: buildType, moveId: moveId, chosenId: selected, onTile: selectTile, onBuilding: inspect, onMove: dragMove }),
                    React.createElement("div", { className: "v4-map-top" },
                        React.createElement("span", null, moveId !== null && selectedBuilding ? `⇄ MOVE ${game_1.catalog[selectedBuilding.type].title.toUpperCase()} TO A FREE TILE` : buildType ? `▼ PLACE ${game_1.catalog[buildType].title.toUpperCase()} ON A GREEN TILE` : '✦ DRAG A BUILDING TO RELOCATE IT'),
                        React.createElement("span", null, "16 \u00D7 14 \u00B7 DRAG TO MOVE")),
                    React.createElement("div", { className: "v4-map-bottom" },
                        React.createElement("span", null, moveId !== null ? 'CLICK A FREE TILE TO RELOCATE THE BUILDING' : buildType ? 'CLICK AN OPEN TILE TO BUILD' : selectedBuilding ? `SELECTED: ${game_1.catalog[selectedBuilding.type].title.toUpperCase()}` : 'DRAG A BUILDING, OR CLICK TO OPEN ITS EDIT MENU'),
                        (buildType || moveId !== null || selectedBuilding) && React.createElement("button", { type: "button", onClick: dismissSelection }, "\u2715 CLEAR"))),
                React.createElement("div", { className: "v4-actions" },
                    React.createElement("div", { className: "v4-next-hint" },
                        React.createElement("strong", null, nextNeed ? `SUGGESTED NEXT BUILD: ${game_1.catalog[nextNeed].title.toUpperCase()}` : 'BASE STABLE — EXPAND OR ASSIGN ENGINEERS'),
                        React.createElement("small", null, nextNeed ? `Your ${game_1.catalog[nextNeed].title.toLowerCase()} support is the weakest link right now.` : 'Click an oxygen generator or water recycler to collect individual supplies; or use Collect All.')),
                    React.createElement("button", { type: "button", className: "v4-scavenge", onClick: () => { const next = (0, game_1.salvage)(game); if (next !== game) {
                            setGame(next);
                            gameAudio_1.gameAudio.play('salvage');
                        }
                        else
                            gameAudio_1.gameAudio.play('error'); }, disabled: game.salvagedToday || game.status !== 'playing' || !!game.pendingCrisis },
                        "\u2692 ",
                        game.salvagedToday ? 'SCAVENGED TODAY' : `SCAVENGE +${(0, game_1.getSalvageYield)(game)} SCRAP`),
                    React.createElement("button", { type: "button", className: "v4-next", onClick: () => { const next = (0, game_1.advanceSol)(game); if (next !== game) {
                            gameAudio_1.gameAudio.play(next.pendingCrisis ? 'warning' : next.status === 'lost' ? 'error' : next.status === 'won' ? 'victory' : next.upgradeJobs.length < game.upgradeJobs.length ? 'upgrade' : 'next');
                            setGame(next);
                        } setBuildType(null); setMoveId(null); }, disabled: game.status !== 'playing' || !!game.pendingCrisis },
                        "NEXT SOL ",
                        React.createElement("span", null, "\u2192"))),
                React.createElement("div", { className: "v4-below" },
                    React.createElement("div", { className: "v4-brief" },
                        React.createElement("span", { className: "v4-kicker" }, "CAPTAIN'S LOG"),
                        React.createElement("p", null, game.log[0]?.message)),
                    React.createElement("div", { className: "v4-brief" },
                        React.createElement("span", { className: "v4-kicker" }, "REAL MARS, FICTIONAL COLONY"),
                        React.createElement("p", null,
                            "The nearby ancient delta is real, but these buildings and the map layout are game artwork inspired by your reference. ",
                            React.createElement("button", { type: "button", onClick: () => setAtlas(true) }, "NASA sources \u2197"))))),
            React.createElement("aside", { className: "v4-right" },
                React.createElement("div", { className: "v4-panel v4-build-panel" },
                    React.createElement("div", { className: "v4-panel-top" },
                        React.createElement("b", null, "BUILD YOUR BASE"),
                        React.createElement("span", null,
                            game_1.buildOrder.length,
                            " STRUCTURES")),
                    React.createElement("p", { className: "v4-build-intro" }, "Place buildings on the grid or drag them to move. Select a structure to assign Mostafa, Taim, or Abdo to multi-sol upgrades (up to Level 5)."),
                    React.createElement("div", { className: "v5-build-tabs", role: "tablist", "aria-label": "Building groups" }, ['Life Support', 'Base & Safety'].map(group => React.createElement("button", { key: group, type: "button", role: "tab", "aria-selected": buildGroup === group, className: buildGroup === group ? 'active' : '', onClick: () => { gameAudio_1.gameAudio.play('select'); setBuildGroup(group); setBuildType(null); } }, group === 'Life Support' ? 'ESSENTIALS' : 'BASE & VEHICLES'))),
                    React.createElement("div", { className: "v4-build-group" },
                        React.createElement("h3", null, buildGroup === 'Life Support' ? 'KEEP THE COLONY ALIVE' : 'EXPAND THE COLONY & VEHICLES'),
                        game_1.buildOrder.filter(type => game_1.catalog[type].group === buildGroup).map(type => {
                            const data = game_1.catalog[type];
                            const chosen = buildType === type;
                            const affordable = (0, game_1.canAfford)(game, data.cost);
                            return React.createElement("button", { type: "button", key: type, className: `v4-build-card ${chosen ? 'active' : ''}`, disabled: game.status !== 'playing' || !!game.pendingCrisis, onClick: () => { gameAudio_1.gameAudio.play('select'); setBuildType(chosen ? null : type); setMoveId(null); setSelected(null); } },
                                React.createElement("img", { src: data.image, alt: "" }),
                                React.createElement("span", { className: "v4-build-name" },
                                    React.createElement("b", null, data.title),
                                    React.createElement("small", null,
                                        data.description.split('.')[0],
                                        ".")),
                                React.createElement("span", { className: `v4-build-price ${!affordable ? 'shortage' : ''}` }, chosen ? '✓' : `⬡ ${data.cost.metal}`));
                        })),
                    selectedBuilding && React.createElement("div", { className: "v4-inspector" },
                        React.createElement("span", { className: "v4-kicker" }, "SELECTED BUILDING"),
                        React.createElement("div", null,
                            React.createElement("img", { src: game_1.catalog[selectedBuilding.type].image, alt: "" }),
                            React.createElement("strong", null, game_1.catalog[selectedBuilding.type].title)),
                        React.createElement("p", null, game_1.catalog[selectedBuilding.type].description),
                        React.createElement("small", null,
                            "LEVEL ",
                            selectedBuilding.level,
                            "/",
                            game_1.MAX_BUILDING_LEVEL,
                            " \u00B7 TECH EFFICIENCY \u00D7",
                            (0, game_1.levelMultiplier)(selectedBuilding.level).toFixed(1)),
                        selectedUpgrade && React.createElement("div", { className: "v8-upgrade-status", role: "status" },
                            React.createElement("strong", null,
                                "\u2692 ",
                                selectedUpgrade.workerName.toUpperCase(),
                                " AT WORK"),
                            React.createElement("span", null,
                                "Level ",
                                selectedBuilding.level,
                                " \u2192 ",
                                selectedUpgrade.targetLevel,
                                " \u00B7 ",
                                selectedUpgrade.remainingSols,
                                " sol",
                                selectedUpgrade.remainingSols === 1 ? '' : 's',
                                " left"),
                            React.createElement("div", { className: "v8-upgrade-track" },
                                React.createElement("span", { style: { width: `${(1 - selectedUpgrade.remainingSols / selectedUpgrade.totalSols) * 100}%` } })),
                            React.createElement("small", null, "Worker is assigned to this building. The level increases only when construction finishes.")),
                        (selectedBuilding.type === 'oxygen' || selectedBuilding.type === 'recycler') && React.createElement("button", { type: "button", className: "v6-collect-building", disabled: game.status !== 'playing' || !!game.pendingCrisis || !game.buildingStores[selectedBuilding.id]?.[selectedBuilding.type === 'oxygen' ? 'oxygen' : 'water'], onClick: () => { const next = (0, game_1.collectBuilding)(game, selectedBuilding.id); if (next !== game) {
                                gameAudio_1.gameAudio.play('collect');
                                setGame(next);
                            }
                            else
                                gameAudio_1.gameAudio.play('error'); } },
                            "COLLECT ",
                            selectedBuilding.type === 'oxygen' ? 'OXYGEN' : 'WATER',
                            " \u00B7 ",
                            Math.round(game.buildingStores[selectedBuilding.id]?.[selectedBuilding.type === 'oxygen' ? 'oxygen' : 'water'] || 0),
                            " READY"),
                        selectedBuilding.type !== 'ark' && React.createElement("div", { className: "v4-inspector-actions" },
                            React.createElement("button", { type: "button", disabled: selectedBuilding.level >= game_1.MAX_BUILDING_LEVEL || !!selectedUpgrade || !nextEngineer || game.sol + (0, game_1.upgradeDuration)(selectedBuilding) > game_1.END_SOL || game.status !== 'playing' || !!game.pendingCrisis, onClick: () => { const next = (0, game_1.upgradeBuilding)(game, selectedBuilding.id); if (next.upgradeJobs.length > game.upgradeJobs.length)
                                    gameAudio_1.gameAudio.play('upgrade');
                                else
                                    gameAudio_1.gameAudio.play('error'); if (next !== game)
                                    setGame(next); } }, selectedBuilding.level >= game_1.MAX_BUILDING_LEVEL ? 'MAX LEVEL REACHED' : selectedUpgrade ? 'WORK IN PROGRESS' : !nextEngineer ? 'ALL ENGINEERS BUSY' : game.sol + (0, game_1.upgradeDuration)(selectedBuilding) > game_1.END_SOL ? 'NOT ENOUGH SOLS LEFT' : `ASSIGN ${nextEngineer.toUpperCase()} · ${(0, game_1.upgradeCost)(selectedBuilding).metal} SCRAP · ${(0, game_1.upgradeDuration)(selectedBuilding)} SOLS`),
                            React.createElement("button", { type: "button", disabled: !!selectedUpgrade || game.status !== 'playing' || !!game.pendingCrisis, onClick: () => { gameAudio_1.gameAudio.play('select'); setBuildType(null); setMoveId(selectedBuilding.id); } }, "MOVE BUILDING"),
                            React.createElement("button", { type: "button", className: "danger", disabled: !!selectedUpgrade || game.status !== 'playing' || !!game.pendingCrisis, onClick: () => { if (window.confirm(`Dismantle ${game_1.catalog[selectedBuilding.type].title}?`)) {
                                    const next = (0, game_1.removeBuilding)(game, selectedBuilding.id);
                                    if (next !== game) {
                                        setGame(next);
                                        gameAudio_1.gameAudio.play('dismantle');
                                    }
                                    setSelected(null);
                                    setMoveId(null);
                                } } }, "DISMANTLE"))),
                    showHelp && React.createElement("div", { className: "v4-tip" },
                        React.createElement("button", { type: "button", "aria-label": "Dismiss help", onClick: () => setShowHelp(false) }, "\u00D7"),
                        React.createElement("strong", null, "HOW TO PLAY"),
                        React.createElement("p", null,
                            "1. Collect oxygen and water from your facilities.",
                            React.createElement("br", null),
                            "2. Complete the changing Daily Quest.",
                            React.createElement("br", null),
                            "3. Use Next Sol to advance and gain more supplies.",
                            React.createElement("br", null),
                            "4. Assign an engineer to upgrade buildings over multiple sols.",
                            React.createElement("br", null),
                            "5. Keep crew alive until Sol 30."))))),
        React.createElement("footer", { className: "v4-footer" },
            "ARES \u00B7 FIRST COLONY \u2014 INDEPENDENT SCI-FI EDUCATIONAL GAME ",
            React.createElement("span", null, "ALL RESOURCE RATES, BUILD TIMES AND CRISIS OUTCOMES ARE GAMEPLAY ASSUMPTIONS, NOT NASA MEASUREMENTS")),
        profileMember && React.createElement(CrewProfile_1.CrewProfile, { member: profileMember, state: game, onClose: closeCrewProfile, onSelect: selectCrewProfile }),
        game.pendingCrisis && React.createElement("div", { className: "modal-layer" },
            React.createElement("div", { className: "v4-modal" },
                React.createElement("span", { className: "v4-kicker" },
                    "INCOMING EMERGENCY \u00B7 SOL ",
                    game.sol),
                React.createElement("h2", null, game_1.crisisText[game.pendingCrisis].title),
                React.createElement("p", null, game_1.crisisText[game.pendingCrisis].description),
                React.createElement("div", { className: "v4-modal-actions" },
                    React.createElement("button", { type: "button", onClick: () => { const next = (0, game_1.resolveCrisis)(game, 0); if (next !== game) {
                            gameAudio_1.gameAudio.play('quest');
                            setGame(next);
                        } } }, game_1.crisisText[game.pendingCrisis].first),
                    React.createElement("button", { type: "button", onClick: () => { const next = (0, game_1.resolveCrisis)(game, 1); if (next !== game) {
                            gameAudio_1.gameAudio.play('quest');
                            setGame(next);
                        } } }, game_1.crisisText[game.pendingCrisis].second)),
                React.createElement("small", null, "Choose one. These are fictional simplified scenarios."))),
        game.status === 'won' && !victoryPlayed && React.createElement(VictoryFilm_1.VictoryFilm, { onFinish: () => setVictoryPlayed(true) }),
        (game.status === 'lost' || (game.status === 'won' && victoryPlayed)) && React.createElement("div", { className: "modal-layer" },
            React.createElement("div", { className: "v4-modal v4-ending" },
                React.createElement("span", { className: "v4-kicker" },
                    "MISSION REPORT \u00B7 SOL ",
                    game.sol),
                React.createElement("h2", null, game.status === 'won' ? 'A NEW DAWN RISES.' : 'THE COLONY WENT SILENT.'),
                React.createElement("p", null, game.ending),
                React.createElement("div", { className: "v4-ending-stats" },
                    React.createElement("span", null,
                        React.createElement("b", null, crewAlive),
                        " active survivors"),
                    React.createElement("span", null,
                        React.createElement("b", null, game.buildings.length),
                        " structures"),
                    React.createElement("span", null,
                        React.createElement("b", null, game.sol),
                        " sols")),
                React.createElement("button", { type: "button", onClick: restart }, "RESTART YOUR COLONY \u2192"),
                game.status === 'won' && React.createElement("button", { type: "button", onClick: () => { gameAudio_1.gameAudio.setGameActive(false); setVictoryPlayed(false); } }, "REPLAY ENDING \u25B6"))),
        atlas && React.createElement("div", { className: "modal-layer", onClick: () => setAtlas(false) },
            React.createElement("div", { className: "v4-modal v4-atlas v6-nasa-atlas", onClick: e => e.stopPropagation() },
                React.createElement("button", { type: "button", className: "v4-close", onClick: () => setAtlas(false) }, "\u2715"),
                React.createElement("span", { className: "v4-kicker" }, "NASA SPACE APPS \u00B7 RESEARCH EVIDENCE"),
                React.createElement("h2", null, "THE REAL SCIENCE BEHIND ARES"),
                React.createElement("p", null,
                    "Challenge: ",
                    React.createElement("a", { href: "https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/", target: "_blank", rel: "noopener noreferrer", style: { color: "#ffd19b", textDecoration: "underline" } }, "Build a Junior Astronaut Mission Trainer \u2197")),
                React.createElement("p", null, "The resources below informed our educational game scenarios and science explanations. Follow each official link to see the original agency material. They are not real-time simulation inputs."),
                React.createElement("h3", null, "Six resources from the challenge"),
                React.createElement("div", { className: "v6-nasa-source-grid" }, nasaResources_1.nasaChallengeResources.map(source => React.createElement("article", { key: source.id, className: "v6-nasa-source" },
                    React.createElement("strong", null, source.name),
                    React.createElement("small", null, source.agency),
                    React.createElement("p", null,
                        React.createElement("b", null, "Evidence:"),
                        " ",
                        source.evidence),
                    React.createElement("p", null,
                        React.createElement("b", null, "Game connection:"),
                        " ",
                        source.connection),
                    React.createElement("p", { className: "v6-nasa-limit" },
                        React.createElement("b", null, "Scope:"),
                        " ",
                        source.qualification),
                    React.createElement("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, "OPEN OFFICIAL RESOURCE \u2197")))),
                React.createElement("h3", null, "Additional NASA research directly connected to buildings"),
                React.createElement("div", { className: "v6-nasa-source-grid" }, nasaResources_1.supportingNASAResearch.map(source => React.createElement("article", { key: source.id, className: "v6-nasa-source" },
                    React.createElement("strong", null, source.name),
                    React.createElement("small", null, source.agency),
                    React.createElement("p", null,
                        React.createElement("b", null, "Published evidence:"),
                        " ",
                        source.evidence),
                    React.createElement("p", null,
                        React.createElement("b", null, "Game connection:"),
                        " ",
                        source.connection),
                    React.createElement("p", { className: "v6-nasa-limit" },
                        React.createElement("b", null, "Scope:"),
                        " ",
                        source.qualification),
                    React.createElement("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, "OPEN OFFICIAL RESOURCE \u2197")))),
                React.createElement("p", { className: "v4-disclaimer" }, "REAL DATA: published NASA/CSA observations and materials, clearly sourced above. DESIGN INSPIRATION: engineering and exploration trade-offs. GAMEPLAY ASSUMPTIONS: all quantities, health changes, event schedules, odds and the base layout. NASA and CSA do not endorse this independent educational game."))),
        confirmRestart && React.createElement("div", { className: "modal-layer", onClick: () => setConfirmRestart(false) },
            React.createElement("div", { className: "v4-modal v4-confirm", onClick: e => e.stopPropagation() },
                React.createElement("h2", null, "START OVER?"),
                React.createElement("p", null, "This resets your saved Edition 6 colony. Your current Sol, crew health, buildings, supplies and quests are saved automatically until you restart."),
                React.createElement("div", { className: "v4-modal-actions" },
                    React.createElement("button", { type: "button", onClick: () => setConfirmRestart(false) }, "KEEP PLAYING"),
                    React.createElement("button", { type: "button", onClick: restart }, "RESTART COLONY")))));
}
exports.default = App;

};
registry["./AudioPanel"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPanel = AudioPanel;
const react_1 = require("react");
const audioSettings_1 = require("./audioSettings");
const gameAudio_1 = require("./gameAudio");
/** Visible, keyboard-friendly volume and mute controls in the game header. */
function AudioPanel() {
    const [settings, setSettings] = (0, react_1.useState)(audioSettings_1.readAudioSettings);
    const change = (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        gameAudio_1.gameAudio.setSettings(next);
        gameAudio_1.gameAudio.unlock();
    };
    const silent = settings.muted || settings.volume === 0;
    return React.createElement("div", { className: "v7-audio-panel", role: "group", "aria-label": "Game audio controls" },
        React.createElement("button", { type: "button", className: `v7-sound-button ${silent ? 'is-muted' : ''}`, "aria-label": silent ? 'Unmute game audio' : 'Mute game audio', "aria-pressed": settings.muted, title: silent ? 'Unmute game audio' : 'Mute game audio', onClick: () => change(settings.volume === 0 && !settings.muted ? { volume: 50, muted: false } : { muted: !settings.muted }) }, silent ? '🔇' : '🔊'),
        React.createElement("label", { className: "v7-volume-label", htmlFor: "v7-game-volume" }, "VOLUME"),
        React.createElement("input", { id: "v7-game-volume", "aria-label": "Game volume", type: "range", min: 0, max: 100, step: 5, value: settings.volume, onChange: e => change({ volume: Number(e.target.value), muted: false }), style: { '--audio-progress': settings.volume + '%' } }),
        React.createElement("span", { className: "v7-volume-value", "aria-live": "off" },
            settings.volume,
            "%"),
        React.createElement("button", { type: "button", className: `v7-music-button ${settings.music ? '' : 'off'}`, "aria-pressed": settings.music, title: settings.music ? 'Turn background music off' : 'Turn background music on', onClick: () => change({ music: !settings.music }) },
            "\u266B ",
            settings.music ? 'ON' : 'OFF'),
        React.createElement("button", { type: "button", className: `v7-effects-button ${settings.effects ? '' : 'off'}`, "aria-pressed": settings.effects, title: settings.effects ? 'Turn game effects off' : 'Turn game effects on', onClick: () => change({ effects: !settings.effects }) },
            "FX ",
            settings.effects ? 'ON' : 'OFF'));
}

};
registry["./ColonyMap"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColonyMap = ColonyMap;
const react_1 = require("react");
const game_1 = require("./game");
const mapMath_1 = require("./mapMath");
const crewRoutes_1 = require("./crewRoutes");
// The buildable terrain lies ON the Mars foreground, not floating in the sky.
// Keep these tile steps synchronized with mapMath.ts, used by drag-and-drop.
const iso = mapMath_1.tileToPixel;
const points = (x, y) => `${x},${y - mapMath_1.ISO_Y} ${x + mapMath_1.ISO_X},${y} ${x},${y + mapMath_1.ISO_Y} ${x - mapMath_1.ISO_X},${y}`;
// Nearly the same ochre as the surrounding ground: an editable grid, not a raised board.
const shades = ['#bb7657', '#b77355', '#b66d50', '#bc7759', '#af684d', '#b87455', '#bf7957', '#b46d50'];
const crewColors = ['#f5c18b', '#89cbff', '#b8ef91', '#fab8dd', '#b8b1ff', '#f9dd8e'];
const pathFromTiles = (coords) => coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${iso(x, y).x} ${iso(x, y).y}`).join(' ');
const roads = [
    [[2, 7], [5, 7], [9, 7], [13, 7]],
    [[5, 2], [5, 5], [5, 8], [5, 12]],
    [[10, 2], [10, 5], [10, 8], [10, 12]],
];
const structureSettings = {
    ark: { size: 210, yLift: 160, deckW: 126, deckH: 64, shadowW: 76, shadowH: 34 },
    greenhouse: { size: 139, yLift: 102, deckW: 77, deckH: 42, shadowW: 57, shadowH: 25 },
    solar: { size: 139, yLift: 100, deckW: 78, deckH: 40, shadowW: 57, shadowH: 23 },
    oxygen: { size: 135, yLift: 96, deckW: 75, deckH: 42, shadowW: 55, shadowH: 25 },
    recycler: { size: 135, yLift: 98, deckW: 75, deckH: 42, shadowW: 55, shadowH: 25 },
    shelter: { size: 135, yLift: 93, deckW: 75, deckH: 42, shadowW: 55, shadowH: 25 },
    habitat: { size: 140, yLift: 99, deckW: 78, deckH: 43, shadowW: 57, shadowH: 25 },
    landing: { size: 165, yLift: 144, deckW: 97, deckH: 46, shadowW: 64, shadowH: 27 },
    rover: { size: 148, yLift: 127, deckW: 83, deckH: 42, shadowW: 58, shadowH: 25 },
    comms: { size: 152, yLift: 131, deckW: 77, deckH: 43, shadowW: 56, shadowH: 24 },
    research: { size: 147, yLift: 124, deckW: 80, deckH: 44, shadowW: 58, shadowH: 25 },
};
function Structure({ building, active }) {
    const [w, h] = (0, game_1.buildingFootprint)(building.type);
    const mid = iso(building.x + (w - 1) / 2, building.y + (h - 1) / 2);
    const settings = structureSettings[building.type];
    const image = game_1.catalog[building.type].image;
    const deck = `${mid.x},${mid.y - 6} ${mid.x + settings.deckW / 2},${mid.y + settings.deckH / 4} ${mid.x},${mid.y + settings.deckH / 2} ${mid.x - settings.deckW / 2},${mid.y + settings.deckH / 4}`;
    const deckInner = `${mid.x},${mid.y + 1} ${mid.x + settings.deckW / 2 - 10},${mid.y + settings.deckH / 4} ${mid.x},${mid.y + settings.deckH / 2 - 8} ${mid.x - settings.deckW / 2 + 10},${mid.y + settings.deckH / 4}`;
    return React.createElement("g", { className: "structure-art" },
        React.createElement("ellipse", { cx: mid.x, cy: mid.y + 19, rx: settings.shadowW, ry: settings.shadowH, fill: "#5f302a", opacity: ".32" }),
        React.createElement("polygon", { points: deck, fill: "#887c75", stroke: "#c99e80", strokeWidth: "1.8", opacity: ".82" }),
        React.createElement("polygon", { points: deckInner, fill: "#d6ae8f", opacity: ".21" }),
        active && React.createElement("ellipse", { cx: mid.x, cy: mid.y + 9, rx: settings.shadowW + 6, ry: settings.shadowH + 5, stroke: "#fff7c3", strokeDasharray: "9 6", strokeWidth: "3", fill: "#fff4a3", fillOpacity: ".11", className: "pulse-line" }),
        React.createElement("image", { href: image, x: mid.x - settings.size / 2, y: mid.y - settings.yLift, width: settings.size, height: settings.size, preserveAspectRatio: "xMidYMid meet" }),
        building.type === 'ark' && React.createElement("g", null,
            React.createElement("rect", { x: mid.x - 62, y: mid.y + 34, width: "124", height: "24", rx: "11", fill: "#243e4f", stroke: "#f2b483", strokeWidth: "2" }),
            React.createElement("text", { x: mid.x, y: mid.y + 50, textAnchor: "middle", fontSize: "12", fontWeight: "900", fill: "#ffe5c1", letterSpacing: "1.4" }, "COMMAND HUB")),
        building.level > 1 && React.createElement("g", null,
            React.createElement("circle", { cx: mid.x + 48, cy: mid.y - 76, r: "17", fill: "#213f63", stroke: "#cfeff2", strokeWidth: "2" }),
            React.createElement("text", { x: mid.x + 48, y: mid.y - 70, textAnchor: "middle", fill: "#fff", fontSize: "14", fontWeight: "900" }, building.level)));
}
function ColonyMap({ state, buildType, moveId, chosenId, onTile, onBuilding, onMove }) {
    const svgRef = (0, react_1.useRef)(null);
    const dragRef = (0, react_1.useRef)(null);
    const [drag, setDrag] = (0, react_1.useState)(null);
    const editable = state.status === 'playing' && !state.pendingCrisis;
    function localPoint(clientX, clientY) {
        const svg = svgRef.current;
        const matrix = svg?.getScreenCTM();
        if (!svg || !matrix)
            return null;
        const point = svg.createSVGPoint();
        point.x = clientX;
        point.y = clientY;
        return point.matrixTransform(matrix.inverse());
    }
    function dragStart(event, b) {
        event.stopPropagation();
        if (!editable || event.button !== 0 || b.type === 'ark' || !!(0, game_1.activeUpgrade)(state, b.id)) {
            onBuilding(b);
            return;
        }
        const point = localPoint(event.clientX, event.clientY);
        if (!point) {
            onBuilding(b);
            return;
        }
        const next = { id: b.id, startX: point.x, startY: point.y, x: b.x, y: b.y, moved: false, pointerId: event.pointerId };
        dragRef.current = next;
        setDrag(next);
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    function dragMove(event) {
        const current = dragRef.current;
        if (!current || event.pointerId !== current.pointerId)
            return;
        const building = state.buildings.find(b => b.id === current.id);
        const pt = localPoint(event.clientX, event.clientY);
        if (!building || !pt)
            return;
        const dx = pt.x - current.startX, dy = pt.y - current.startY;
        const { x: diffX, y: diffY } = (0, mapMath_1.snapIsoDrag)(dx, dy);
        const moved = current.moved || Math.hypot(dx, dy) > 9;
        const candidate = { ...current, x: building.x + diffX, y: building.y + diffY, moved };
        if (candidate.x === current.x && candidate.y === current.y && candidate.moved === current.moved)
            return;
        dragRef.current = candidate;
        setDrag(candidate);
    }
    function dragEnd(event) {
        const d = dragRef.current;
        if (!d || event.pointerId !== d.pointerId)
            return;
        const b = state.buildings.find(item => item.id === d.id);
        if (b) {
            if (d.moved) {
                if ((0, game_1.canPlace)(state, b.type, d.x, d.y, b.id))
                    onMove(b.id, d.x, d.y);
            }
            else
                onBuilding(b);
        }
        dragRef.current = null;
        setDrag(null);
    }
    const tiles = Array.from({ length: game_1.GRID_W * game_1.GRID_H }, (_, i) => ({ x: i % game_1.GRID_W, y: Math.floor(i / game_1.GRID_W) })).sort((a, b) => (a.x + a.y) - (b.x + b.y));
    const structures = [...state.buildings].sort((a, b) => (a.x + a.y) - (b.x + b.y));
    const walkPaths = (0, crewRoutes_1.crewMotionPaths)(state);
    const workerJobs = state.crew.map(member => state.upgradeJobs.find(job => job.workerName === member.name));
    const workPaths = workerJobs.map((job, i) => job ? (0, crewRoutes_1.crewUpgradeMotionPath)(state, job.buildingId, i) : '');
    const movingBuilding = moveId !== null ? state.buildings.find(item => item.id === moveId) ?? null : null;
    const draggedBuilding = drag?.moved ? state.buildings.find(item => item.id === drag.id) ?? null : null;
    const dragAllowed = !!draggedBuilding && (0, game_1.canPlace)(state, draggedBuilding.type, drag.x, drag.y, draggedBuilding.id);
    const activeType = movingBuilding?.type ?? buildType ?? draggedBuilding?.type ?? null;
    return React.createElement("svg", { ref: svgRef, className: "colony-svg", viewBox: "0 0 1440 810", preserveAspectRatio: "xMidYMid meet", role: "img", "aria-label": "Interactive isometric Mars colony. Drag any placed building to another free tile, or click it to edit.", onPointerMove: dragMove, onPointerUp: dragEnd, onPointerCancel: () => { dragRef.current = null; setDrag(null); } },
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "mars-sky", x1: "0", x2: "0", y1: "0", y2: "1" },
                React.createElement("stop", { stopColor: "#633d63" }),
                React.createElement("stop", { offset: ".31", stopColor: "#e78154" }),
                React.createElement("stop", { offset: ".71", stopColor: "#ffb269" }),
                React.createElement("stop", { offset: "1", stopColor: "#cc7151" })),
            React.createElement("linearGradient", { id: "mars-ground", x1: "0", x2: "0", y1: "0", y2: "1" },
                React.createElement("stop", { stopColor: "#ba7054" }),
                React.createElement("stop", { offset: ".55", stopColor: "#ad604a" }),
                React.createElement("stop", { offset: "1", stopColor: "#86463d" })),
            React.createElement("radialGradient", { id: "map-sun-glow" },
                React.createElement("stop", { stopColor: "#ffe9ad", stopOpacity: ".92" }),
                React.createElement("stop", { offset: ".26", stopColor: "#ffc58d", stopOpacity: ".57" }),
                React.createElement("stop", { offset: ".7", stopColor: "#faac79", stopOpacity: ".12" }),
                React.createElement("stop", { offset: "1", stopColor: "#ffad78", stopOpacity: "0" })),
            React.createElement("linearGradient", { id: "mountain-back", x1: "0", x2: "0", y1: "0", y2: "1" },
                React.createElement("stop", { stopColor: "#8d5463" }),
                React.createElement("stop", { offset: "1", stopColor: "#bd7561" })),
            React.createElement("linearGradient", { id: "mountain-mid", x1: "0", x2: "0", y1: "0", y2: "1" },
                React.createElement("stop", { stopColor: "#9e5652" }),
                React.createElement("stop", { offset: "1", stopColor: "#b87358" })),
            React.createElement("linearGradient", { id: "mountain-front", x1: "0", x2: "0", y1: "0", y2: "1" },
                React.createElement("stop", { stopColor: "#a9634f" }),
                React.createElement("stop", { offset: "1", stopColor: "#985348" })),
            React.createElement("filter", { id: "map-shadow", x: "-40%", y: "-40%", width: "180%", height: "180%" },
                React.createElement("feGaussianBlur", { stdDeviation: "8" })),
            React.createElement("pattern", { id: "mars-sand", width: "66", height: "53", patternUnits: "userSpaceOnUse" },
                React.createElement("circle", { cx: "12", cy: "20", r: "2", fill: "#f7b88b", opacity: ".2" }),
                React.createElement("circle", { cx: "44", cy: "9", r: "1.5", fill: "#61312b", opacity: ".2" }),
                React.createElement("path", { d: "M10 44l18-4", stroke: "#f6ab7c", strokeWidth: "2", opacity: ".13" }))),
        React.createElement("rect", { width: "1440", height: "810", fill: "url(#mars-sky)" }),
        React.createElement("ellipse", { cx: "1112", cy: "162", rx: "305", ry: "220", fill: "url(#map-sun-glow)" }),
        React.createElement("circle", { cx: "1095", cy: "189", r: "49", fill: "#ffe7b1", opacity: ".88" }),
        React.createElement("circle", { cx: "1095", cy: "189", r: "35", fill: "#fff5cc", opacity: ".63" }),
        React.createElement("path", { d: "M0 310 L0 245 Q55 233 81 215 L118 207 L144 220 L170 175 Q185 162 196 170 L221 216 L259 228 L291 192 L326 197 L357 240 L397 250 L439 210 L469 217 L499 236 L537 193 L559 188 L592 225 L626 239 L675 228 L715 253 L756 240 L792 192 L815 177 L843 202 L864 226 L919 251 L960 229 L1001 205 L1032 231 L1090 242 L1144 215 L1181 209 L1215 182 L1243 184 L1281 222 L1320 205 L1357 190 L1394 218 L1440 202 L1440 350Z", fill: "url(#mountain-back)", opacity: ".72" }),
        React.createElement("path", { d: "M0 326 L0 269 L79 282 L125 249 L159 255 L192 234 L217 239 L248 278 L310 285 L355 257 L400 284 L451 280 L482 251 L537 265 L587 285 L624 270 L665 288 L716 264 L755 280 L790 261 L833 270 L874 294 L919 272 L965 285 L1008 259 L1037 280 L1073 273 L1115 291 L1157 264 L1198 290 L1242 248 L1282 264 L1326 253 L1362 271 L1399 245 L1440 255 L1440 359Z", fill: "url(#mountain-mid)", opacity: ".85" }),
        React.createElement("g", { stroke: "#dc9676", strokeOpacity: ".17", strokeWidth: "3", fill: "none" },
            React.createElement("path", { d: "M178 222l30 42 32 11M315 279l-28 16M575 256l-29 29M783 269l32 34 33 9M1028 279l-15 26M1241 251l34 44" })),
        React.createElement("path", { d: "M0 332 Q107 321 182 314 L253 306 L313 321 L397 303 L474 314 L541 303 L614 329 L682 315 L756 327 L833 309 L904 323 L968 304 L1038 322 L1118 306 L1194 323 L1284 307 L1381 314 L1440 297 L1440 412 L0 412Z", fill: "url(#mountain-front)", opacity: ".66" }),
        React.createElement("path", { d: "M0 327 Q310 302 660 327 Q1010 302 1440 324 L1440 810 H0Z", fill: "url(#mars-ground)" }),
        React.createElement("rect", { y: "340", width: "1440", height: "470", fill: "url(#mars-sand)", opacity: ".7" }),
        React.createElement("path", { d: "M0 429 Q162 379 272 407 L339 465 Q147 456 0 495Z", fill: "#934d40", opacity: ".42" }),
        React.createElement("path", { d: "M1186 413 L1327 343 L1440 360 L1440 496 L1349 474Z", fill: "#935043", opacity: ".39" }),
        React.createElement("g", { stroke: "#e7a27b", strokeOpacity: ".18", strokeWidth: "2", fill: "none" },
            React.createElement("path", { d: "M14 524l111-12 85 15M102 609l143-22M1120 608l126-23 89 13M1260 711l125-10" })),
        React.createElement("path", { d: "M720 324 L1210 569 L780 760 L300 569 Z", fill: "#b36b52", opacity: ".10", filter: "url(#map-shadow)", pointerEvents: "none" }),
        React.createElement("g", null, tiles.map(({ x, y }) => {
            const p = iso(x, y);
            const valid = !!activeType && (0, game_1.canPlace)(state, activeType, x, y, draggedBuilding?.id ?? moveId ?? undefined);
            return React.createElement("g", { key: `${x},${y}`, className: `terrain-tile ${activeType ? 'build-ready' : ''}`, onClick: () => onTile(x, y), role: activeType ? 'button' : undefined, "aria-label": activeType ? `${valid ? 'Place' : 'Unavailable'} ${game_1.catalog[activeType].title} at tile ${x + 1},${y + 1}` : undefined, tabIndex: activeType ? 0 : undefined, onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTile(x, y);
                } } },
                React.createElement("polygon", { points: points(p.x, p.y), fill: shades[(x * 13 + y * 7) % shades.length], stroke: "#edbd96", strokeOpacity: ".07", strokeWidth: ".75" }),
                ((x + y) % 3 === 0) && React.createElement("path", { d: `M${p.x - 13} ${p.y + 6}l5-1 m13 3 l8-2`, stroke: "#e79d72", strokeOpacity: ".14", strokeWidth: "2" }),
                activeType && React.createElement("polygon", { points: points(p.x, p.y), fill: valid ? '#8feec2' : '#fa8062', fillOpacity: valid ? '.34' : '.16', stroke: valid ? '#c8ffcf' : '#e28e70', strokeWidth: "2", strokeDasharray: "5 5" }));
        })),
        React.createElement("g", { pointerEvents: "none" },
            roads.map((road, i) => React.createElement("g", { key: i },
                React.createElement("path", { d: pathFromTiles(road), fill: "none", stroke: "#6e5148", strokeWidth: "20", strokeLinejoin: "round", strokeLinecap: "round", opacity: ".49" }),
                React.createElement("path", { d: pathFromTiles(road), fill: "none", stroke: "#cf9f7b", strokeWidth: "13", strokeLinejoin: "round", strokeLinecap: "round", opacity: ".62" }),
                React.createElement("path", { d: pathFromTiles(road), fill: "none", stroke: "#eac5a4", strokeWidth: "1.5", strokeDasharray: "6 11", opacity: ".7" }))),
            React.createElement("path", { d: "M720 326 L1217 565 L780 762 L293 565 Z", fill: "none", stroke: "#754b49", strokeWidth: "5", strokeDasharray: "36 12", opacity: ".36" }),
            [[308, 533], [514, 431], [719, 340], [961, 449], [1202, 568], [1000, 669], [789, 763], [519, 649]].map(([x, y], i) => React.createElement("g", { key: i },
                React.createElement("ellipse", { cx: x, cy: y + 10, rx: "11", ry: "5", fill: "#60352f", opacity: ".56" }),
                React.createElement("path", { d: `M${x - 4} ${y + 6}v-17h8v17`, fill: "#b99a81", stroke: "#5c5860", strokeWidth: "2" }),
                React.createElement("circle", { cx: x, cy: y - 15, r: "4", fill: "#b9effb", stroke: "#effdff", strokeWidth: "1" }))),
            [[350, 627], [390, 651], [1074, 664], [1122, 683]].map(([x, y], i) => React.createElement("g", { key: i, transform: `translate(${x} ${y})` },
                React.createElement("rect", { x: "-13", y: "-14", width: "26", height: "23", rx: "3", fill: i % 2 ? '#ba855f' : '#8e7b77', stroke: "#f7c19c", strokeWidth: "2" }),
                React.createElement("path", { d: "M-13 -7H13M0 -14V9", stroke: "#e6d3b8", strokeWidth: "2", opacity: ".6" })))),
        [[204, 388], [1264, 499], [375, 679], [1210, 344], [1100, 730], [268, 614], [524, 206]].map(([x, y], i) => React.createElement("g", { key: i, pointerEvents: "none", opacity: ".75" },
            React.createElement("ellipse", { cx: x, cy: y + 7, rx: 16, ry: 6, fill: "#68332d" }),
            React.createElement("path", { d: `M${x - 15} ${y + 3}l4-15 13-4 11 12-4 10Z`, fill: i % 2 ? '#9a5845' : '#d6936c', stroke: "#71453e", strokeWidth: "2" }))),
        structures.map(b => React.createElement("g", { key: b.id, className: `select-building ${draggedBuilding?.id === b.id ? 'drag-original' : ''}`, onPointerDown: event => dragStart(event, b), role: "button", "aria-label": `Select or drag ${game_1.catalog[b.type].title}`, tabIndex: 0, onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onBuilding(b);
            } } },
            React.createElement(Structure, { building: b, active: b.id === chosenId }))),
        draggedBuilding && drag && React.createElement("g", { className: `drag-preview ${dragAllowed ? '' : 'invalid'}` },
            React.createElement(Structure, { building: { ...draggedBuilding, x: drag.x, y: drag.y }, active: dragAllowed })),
        React.createElement("g", { pointerEvents: "none" }, state.upgradeJobs.map(job => {
            const b = state.buildings.find(item => item.id === job.buildingId);
            if (!b)
                return null;
            const [w, h] = (0, game_1.buildingFootprint)(b.type);
            const mid = iso(b.x + (w - 1) / 2, b.y + (h - 1) / 2);
            const fraction = (job.totalSols - job.remainingSols) / job.totalSols;
            return React.createElement("g", { key: `upgrade-${job.buildingId}`, transform: `translate(${mid.x},${mid.y - 126})` },
                React.createElement("rect", { x: "-76", y: "-29", width: "152", height: "44", rx: "9", fill: "#112b3a", fillOpacity: ".92", stroke: "#ffd191", strokeWidth: "2" }),
                React.createElement("text", { x: "0", y: "-10", textAnchor: "middle", fontSize: "12", fill: "#ffe1a6", fontWeight: "900" },
                    "\u2692 ",
                    job.workerName.toUpperCase(),
                    " \u00B7 LEVEL ",
                    job.targetLevel),
                React.createElement("rect", { x: "-60", y: "-1", width: "120", height: "6", rx: "3", fill: "#42596c" }),
                React.createElement("rect", { x: "-60", y: "-1", width: 120 * fraction, height: "6", rx: "3", fill: "#80ebbd" }),
                React.createElement("text", { x: "0", y: "14", textAnchor: "middle", fontSize: "9", fill: "#e2edf0" },
                    job.remainingSols,
                    " SOLS LEFT"),
                React.createElement("g", { className: "v8-map-spark", transform: "translate(63,-40)" },
                    React.createElement("path", { d: "M0 -9V9M-9 0H9M-6 -6L6 6M6 -6L-6 6", stroke: "#ffd895", strokeWidth: "2" })));
        })),
        state.crew.map((c, i) => c.health <= 0 ? null : React.createElement("g", { key: c.name, className: `astronaut ${workerJobs[i] ? 'v8-working-astronaut' : ''}`, pointerEvents: "none" },
            workerJobs[i] && workPaths[i] ?
                React.createElement("animateMotion", { key: `job-${workerJobs[i]?.buildingId}-${workerJobs[i]?.startedSol}`, path: workPaths[i], dur: "3.2s", begin: "0s", repeatCount: "1", fill: "freeze", calcMode: "linear", rotate: "0" }) :
                React.createElement("animateMotion", { key: `${i}-${state.buildings.map(b => `${b.id}:${b.x}:${b.y}`).join('|')}`, path: walkPaths[i], dur: `${14 + i * 2.3}s`, begin: `-${i * 2.7}s`, repeatCount: "indefinite", calcMode: "linear", rotate: "0" }),
            React.createElement("ellipse", { cx: "0", cy: "7", rx: "11", ry: "4", fill: "#43282a", opacity: ".58" }),
            React.createElement("g", { className: `astronaut-bob astronaut-${i}` },
                React.createElement("image", { href: "assets/crew/astronaut-idle.png", x: "-16", y: "-44", width: "32", height: "46" }),
                React.createElement("rect", { x: "-40", y: "11", width: "80", height: "17", rx: "8", fill: "#243a48", stroke: workerJobs[i] ? '#ffcb78' : crewColors[i], strokeWidth: "1.5" }),
                React.createElement("text", { x: "0", y: "23", textAnchor: "middle", fontSize: "10", fontWeight: "900", fill: "#fff3de" },
                    c.name.replace('Scientist ', '').replace('Dr. ', 'Dr '),
                    workerJobs[i] ? ' ⚒' : '')))),
        React.createElement("g", { pointerEvents: "none" },
            React.createElement("rect", { x: "31", y: "31", width: "283", height: "56", rx: "12", fill: "#202836", fillOpacity: ".7", stroke: "#fff0c2", strokeOpacity: ".2" }),
            React.createElement("text", { x: "48", y: "56", fill: "#fff0d5", fontSize: "22", fontWeight: "900", letterSpacing: "3" }, "JEZERO CRATER"),
            React.createElement("text", { x: "48", y: "74", fill: "#ffd2a7", fontSize: "10", fontWeight: "800", letterSpacing: "1" }, "FICTIONAL BASE \u00B7 ISOMETRIC SETTLEMENT")),
        state.dustDays > 0 && React.createElement("rect", { width: "1440", height: "810", fill: "#f9b075", opacity: ".20", pointerEvents: "none", className: "dust-overlay" }));
}

};
registry["./CrewProfile"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrewProfile = CrewProfile;
const react_1 = require("react");
const crewProfiles_1 = require("./crewProfiles");
/** Full-screen-in-miniature mission dossier. Vitals are explicitly simulated game indicators. */
function CrewProfile({ member, state, onClose, onSelect }) {
    const closeRef = (0, react_1.useRef)(null);
    const dossier = (0, crewProfiles_1.getCrewDossier)(member) ?? crewProfiles_1.crewDossiers[0];
    const vitals = (0, crewProfiles_1.getCrewVitals)(state, member.name);
    const index = Math.max(0, crewProfiles_1.crewDossiers.findIndex(c => c.name === member.name));
    const selectOffset = (offset) => {
        const next = (index + offset + crewProfiles_1.crewDossiers.length) % crewProfiles_1.crewDossiers.length;
        onSelect(crewProfiles_1.crewDossiers[next].name);
    };
    (0, react_1.useEffect)(() => {
        closeRef.current?.focus();
        const handleKey = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                selectOffset(-1);
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                selectOffset(1);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
        // Intentional: use the currently open dossier's keyboard behavior each time it changes.
    }, [member.name, onClose, onSelect]);
    return React.createElement("div", { className: "v9-profile-backdrop", onMouseDown: (e) => { if (e.target === e.currentTarget)
            onClose(); } },
        React.createElement("section", { className: "v9-profile", role: "dialog", "aria-modal": "true", "aria-labelledby": "v9-profile-title", style: { '--crew-accent': dossier.accent } },
            React.createElement("div", { className: "v9-profile-topline" },
                React.createElement("span", null,
                    React.createElement("span", { className: "v9-online-indicator" }),
                    " ARES / CREW MEDICAL DOSSIER"),
                React.createElement("span", null,
                    "SOL ",
                    state.sol,
                    " / 30 \u00A0 \u2022 \u00A0 PERSONNEL ",
                    String(index + 1).padStart(2, '0'),
                    " / 06"),
                React.createElement("button", { type: "button", ref: closeRef, className: "v9-profile-close", "aria-label": "Close crew profile", onClick: onClose }, "\u2715")),
            React.createElement("div", { className: "v9-profile-main" },
                React.createElement("aside", { className: "v9-profile-identity" },
                    React.createElement("div", { className: "v9-profile-photo" },
                        React.createElement("img", { src: dossier.portrait, alt: `Illustrated portrait of ${member.name}` }),
                        React.createElement("span", { className: "v9-photo-id" },
                            dossier.callsign,
                            " \u00A0 \u2022 \u00A0 CREW MEMBER")),
                    React.createElement("span", { className: "v9-profile-eyebrow" }, dossier.department),
                    React.createElement("h2", { id: "v9-profile-title" }, member.name),
                    React.createElement("div", { className: "v9-profile-role" }, member.role),
                    React.createElement("span", { className: `v9-profile-status ${vitals.overall.toLowerCase().replace(/ /g, '-')}` },
                        React.createElement("span", null),
                        " ",
                        vitals.overall),
                    React.createElement("p", { className: "v9-quote" },
                        "\u201C",
                        dossier.quote,
                        "\u201D")),
                React.createElement("div", { className: "v9-profile-information" },
                    React.createElement("div", { className: "v9-section-label" },
                        React.createElement("span", null, "01"),
                        " PERSONNEL BACKGROUND"),
                    React.createElement("p", { className: "v9-biography" }, dossier.summary),
                    React.createElement("div", { className: "v9-profile-traits" }, dossier.expertise.map(s => React.createElement("span", { key: s }, s))),
                    React.createElement("div", { className: "v9-metric-heading" },
                        React.createElement("div", { className: "v9-section-label" },
                            React.createElement("span", null, "02"),
                            " VITAL MEASUREMENTS"),
                        React.createElement("span", null, "SIMULATED \u2022 IN-GAME")),
                    React.createElement("div", { className: "v9-metrics" },
                        React.createElement("article", { className: `v9-metric v9-heart ${vitals.heartRate === 0 ? 'no-pulse' : ''}`, style: { '--heart-period': `${60 / Math.max(45, vitals.heartRate)}s` } },
                            React.createElement("div", { className: "v9-metric-label" },
                                React.createElement("span", null, "\u2665"),
                                " HEART RATE"),
                            React.createElement("div", { className: "v9-metric-figure" },
                                React.createElement("strong", null, vitals.heartRate || '—'),
                                React.createElement("small", null, "BPM")),
                            React.createElement("span", { className: "v9-metric-state" }, vitals.heartLabel),
                            React.createElement("svg", { className: "v9-pulse", viewBox: "0 0 240 54", preserveAspectRatio: "none", "aria-hidden": "true" },
                                React.createElement("path", { d: "M0 30 L45 30 L60 30 L70 8 L83 46 L97 20 L111 30 L155 30 L167 30 L178 8 L191 46 L203 20 L216 30 L240 30", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinejoin: "round" }))),
                        React.createElement("article", { className: "v9-metric v9-anxiety" },
                            React.createElement("div", { className: "v9-metric-label" },
                                React.createElement("span", null, "\u25C8"),
                                " ANXIETY LEVEL"),
                            React.createElement("div", { className: "v9-metric-figure" },
                                React.createElement("strong", null, vitals.anxiety),
                                React.createElement("small", null, "/ 100")),
                            React.createElement("span", { className: "v9-metric-state" }, vitals.anxietyLabel),
                            React.createElement("div", { className: "v9-gauge" },
                                React.createElement("div", { style: { width: `${vitals.anxiety}%` } })),
                            React.createElement("div", { className: "v9-scale" },
                                React.createElement("span", null, "CALM"),
                                React.createElement("span", null, "HIGH STRAIN"))),
                        React.createElement("article", { className: "v9-metric v9-health" },
                            React.createElement("div", { className: "v9-metric-label" },
                                React.createElement("span", null, "\u271A"),
                                " CREW HEALTH"),
                            React.createElement("div", { className: "v9-metric-figure" },
                                React.createElement("strong", null, Math.round(vitals.health)),
                                React.createElement("small", null, "%")),
                            React.createElement("span", { className: "v9-metric-state" }, vitals.health > 65 ? 'GOOD' : vitals.health > 30 ? 'NEEDS CARE' : 'CRITICAL'),
                            React.createElement("div", { className: "v9-health-track" },
                                React.createElement("div", { style: { width: `${vitals.health}%` } })))),
                    React.createElement("div", { className: "v9-section-label v9-ops-label" },
                        React.createElement("span", null, "03"),
                        " CURRENT CONDITIONS & ASSIGNMENT"),
                    React.createElement("div", { className: "v9-profile-operations" },
                        React.createElement("div", { className: "v9-ops-tags" },
                            React.createElement("span", { className: vitals.oxygenPressure ? 'v9-tag-alert' : 'v9-tag-ok' },
                                "O\u2082 ",
                                vitals.oxygenPressure ? 'LOW RESERVE' : 'RESERVES OK'),
                            React.createElement("span", { className: vitals.waterPressure ? 'v9-tag-alert' : 'v9-tag-ok' },
                                "H\u2082O ",
                                vitals.waterPressure ? 'LOW RESERVE' : 'RESERVES OK'),
                            state.pendingCrisis && React.createElement("span", { className: "v9-tag-alert" }, "ACTIVE EMERGENCY")),
                        React.createElement("p", null, vitals.observation),
                        React.createElement("small", null, vitals.activeJob ?? (vitals.health === 0 ? 'UNAVAILABLE FOR DUTY' : 'Available for regular colony duty and daily missions'))),
                    React.createElement("div", { className: "v9-disclaimer" }, "These heart-rate and anxiety values are fictional training estimates calculated from game conditions, not live wearable measurements, medical advice, or NASA physiological data."))),
            React.createElement("div", { className: "v9-profile-footer" },
                React.createElement("span", null, "SELECT ANOTHER CREW MEMBER"),
                React.createElement("div", { className: "v9-portrait-nav" }, crewProfiles_1.crewDossiers.map(d => React.createElement("button", { key: d.name, type: "button", "aria-label": `View ${d.name} profile`, title: d.name, className: d.name === member.name ? 'active' : '', onClick: () => onSelect(d.name) },
                    React.createElement("img", { src: d.portrait, alt: "" })))),
                React.createElement("div", { className: "v9-next-controls" },
                    React.createElement("button", { type: "button", onClick: () => selectOffset(-1) }, "\u2190 PREV"),
                    React.createElement("button", { type: "button", onClick: () => selectOffset(1) }, "NEXT \u2192")))));
}

};
registry["./Story"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Story = Story;
const react_1 = require("react");
const gameAudio_1 = require("./gameAudio");
const filmUrl = 'assets/cutscene/ARES_The_Last_Dawn_Continuity_Fixed_1080p.mp4';
const posterUrl = 'assets/cutscene/premium-scene-poster.jpg';
/** The opening is always accessible, even with an existing save.
 * BEGIN plays the actual bundled film, then resumes the saved colony if present. */
function Story({ onStart, hasSave, onResume }) {
    const videoRef = (0, react_1.useRef)(null);
    const timerRef = (0, react_1.useRef)(null);
    const exitingRef = (0, react_1.useRef)(false);
    const [begun, setBegun] = (0, react_1.useState)(false);
    const [leaving, setLeaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const finish = (0, react_1.useCallback)((delay = 450) => {
        if (exitingRef.current)
            return;
        exitingRef.current = true;
        videoRef.current?.pause();
        setLeaving(true);
        timerRef.current = window.setTimeout(onStart, delay);
    }, [onStart]);
    (0, react_1.useEffect)(() => () => {
        if (timerRef.current !== null)
            clearTimeout(timerRef.current);
        videoRef.current?.pause();
    }, []);
    (0, react_1.useEffect)(() => {
        if (!begun || leaving)
            return;
        const onKey = (event) => { if (event.repeat)
            return; event.preventDefault(); finish(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [begun, leaving, finish]);
    const begin = async () => {
        const video = videoRef.current;
        if (!video) {
            setError('The intro cannot be loaded.');
            return;
        }
        try {
            gameAudio_1.gameAudio.unlock();
            gameAudio_1.gameAudio.play('start', true);
            video.currentTime = 0;
            video.muted = false;
            video.volume = 1;
            await video.play();
            setBegun(true);
            setError('');
        }
        catch {
            setError('The film did not play. Try BEGIN again, or use START GAME WITHOUT INTRO.');
        }
    };
    (0, react_1.useEffect)(() => {
        if (!error || begun)
            return;
        const onKey = (event) => { if (event.key === 'Enter')
            finish(0); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [error, begun, finish]);
    return React.createElement("div", { className: `cinema cinema-premium ${begun ? 'cinema-rolling' : 'cinema-awaiting'} ${leaving ? 'cinema-leaving' : ''}`, "aria-label": "ARES First Colony opening cinematic", onPointerDownCapture: begun && !leaving ? () => finish() : undefined },
        React.createElement("video", { className: "cinema-video", ref: videoRef, src: filmUrl, poster: posterUrl, preload: "auto", playsInline: true, disablePictureInPicture: true, onEnded: () => finish(600), onError: () => setError('The film could not load. Use START GAME WITHOUT INTRO below, or check the video file.'), "aria-label": "The Last Dawn cinematic opening" }),
        !begun && React.createElement("div", { className: "cinema-entry cinema-entry-minimal" },
            React.createElement("h1", { className: "cinema-title" },
                "ARES ",
                React.createElement("span", null, "FIRST COLONY")),
            React.createElement("button", { type: "button", className: "cinema-play cinema-begin", onClick: () => void begin() },
                React.createElement("span", null, "\u25B6"),
                " BEGIN"),
            hasSave && React.createElement("button", { type: "button", className: "cinema-resume-save", onClick: () => { gameAudio_1.gameAudio.unlock(); onResume(); } }, "CONTINUE SAVED COLONY"),
            error && React.createElement("button", { type: "button", className: "cinema-resume-save", onClick: onStart }, "START GAME WITHOUT INTRO"),
            error && React.createElement("p", { className: "cinema-minimal-error", role: "alert" }, error)),
        begun && React.createElement("span", { className: "cinema-skip-hint" }, "PRESS ANY KEY / TAP TO SKIP"),
        React.createElement("div", { className: "cinema-blackout", "aria-hidden": "true" }));
}

};
registry["./VictoryFilm"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VictoryFilm = VictoryFilm;
const react_1 = require("react");
/** The video includes a cinematic rocket flyby past the sunrise. The fallback play button handles
 * browsers that block sound-on autoplay, and skip always leads to the results. */
function VictoryFilm({ onFinish }) {
    const videoRef = (0, react_1.useRef)(null);
    const [manualPlay, setManualPlay] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const video = videoRef.current;
        if (!video)
            return;
        let disposed = false;
        video.play().catch(() => { if (!disposed)
            setManualPlay(true); });
        return () => { disposed = true; video.pause(); };
    }, []);
    const play = () => {
        const video = videoRef.current;
        if (!video)
            return;
        void video.play().then(() => setManualPlay(false)).catch(() => setManualPlay(true));
    };
    return React.createElement("div", { className: "v5-victory-screen", role: "dialog", "aria-label": "Sol 30 victory movie" },
        React.createElement("video", { ref: videoRef, autoPlay: true, playsInline: true, controls: true, preload: "auto", src: "assets/video/sol30-victory-ending.mp4", onEnded: onFinish, onError: () => setManualPlay(true), "aria-label": "Martian sunrise, sleek rocket flyby, then THE END" }),
        manualPlay && React.createElement("button", { type: "button", className: "v6-play-ending", onClick: play }, "\u25B6 PLAY THE ENDING"),
        React.createElement("button", { type: "button", className: "v5-victory-skip", onClick: onFinish }, "SKIP ENDING \u2192"));
}

};
registry["./audioSettings"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAudioSettings = exports.audioSettingsKey = void 0;
exports.normalizeAudioSettings = normalizeAudioSettings;
exports.readAudioSettings = readAudioSettings;
exports.storeAudioSettings = storeAudioSettings;
/** Audio settings are independent of the colony save and stay across reloads. */
exports.audioSettingsKey = 'ares-first-colony-audio-v1';
exports.defaultAudioSettings = { volume: 50, muted: false, music: true, effects: true };
function normalizeAudioSettings(candidate) {
    const x = candidate && typeof candidate === 'object' ? candidate : {};
    const volume = typeof x.volume === 'number' && Number.isFinite(x.volume)
        ? Math.max(0, Math.min(100, Math.round(x.volume))) : exports.defaultAudioSettings.volume;
    return {
        volume,
        muted: typeof x.muted === 'boolean' ? x.muted : exports.defaultAudioSettings.muted,
        music: typeof x.music === 'boolean' ? x.music : exports.defaultAudioSettings.music,
        effects: typeof x.effects === 'boolean' ? x.effects : exports.defaultAudioSettings.effects,
    };
}
function readAudioSettings() {
    try {
        if (typeof localStorage === 'undefined')
            return { ...exports.defaultAudioSettings };
        const stored = localStorage.getItem(exports.audioSettingsKey);
        if (!stored)
            return { ...exports.defaultAudioSettings };
        const settings = normalizeAudioSettings(JSON.parse(stored));
        // One-time migration: the old 35% default becomes 50%, while other chosen values remain.
        const migrationKey = 'ares-audio-default-50-migrated';
        if (localStorage.getItem(migrationKey) !== 'yes') {
            if (settings.volume === 35)
                settings.volume = 50;
            localStorage.setItem(migrationKey, 'yes');
            localStorage.setItem(exports.audioSettingsKey, JSON.stringify(settings));
        }
        return settings;
    }
    catch {
        return { ...exports.defaultAudioSettings };
    }
}
function storeAudioSettings(settings) {
    try {
        if (typeof localStorage !== 'undefined')
            localStorage.setItem(exports.audioSettingsKey, JSON.stringify(settings));
    }
    catch { /* Private-mode storage can fail. */ }
}

};
registry["./crewProfiles"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crewDossiers = void 0;
exports.getCrewVitals = getCrewVitals;
exports.getCrewDossier = getCrewDossier;
exports.crewDossiers = [
    {
        name: 'Weso', callsign: 'ARES-01', department: 'MISSION COMMAND',
        summary: 'Captain Weso leads the six-person expedition after the emergency landing near Jezero Crater. He sets priorities, weighs the crew’s safety against the colony’s needs, and keeps the mission moving when supplies are scarce.',
        expertise: ['Mission decisions', 'Crew coordination', 'Emergency response'],
        quote: 'A future is built one careful decision at a time.',
        accent: '#e8b580', portrait: 'assets/crew/portraits/weso.webp',
    },
    {
        name: 'Taim', callsign: 'ARES-02', department: 'FIELD ENGINEERING',
        summary: 'Taim maintains the power grid, investigates system failures, and helps rebuild damaged facilities. During an upgrade he travels to the worksite and works across multiple Martian sols.',
        expertise: ['Power systems', 'Facility upgrades', 'Technical repairs'],
        quote: 'Every system deserves a backup plan.',
        accent: '#80c9ee', portrait: 'assets/crew/portraits/taim.webp',
    },
    {
        name: 'Abdo', callsign: 'ARES-03', department: 'EXPLORATION & CONSTRUCTION',
        summary: 'Abdo explores the rocky ground around the outpost and recovers useful materials. He also joins engineering assignments, helping the colony expand safely without blocking its walkways.',
        expertise: ['Terrain exploration', 'Material recovery', 'Construction'],
        quote: 'Beyond the next ridge, we find a way forward.',
        accent: '#c1de91', portrait: 'assets/crew/portraits/abdo.webp',
    },
    {
        name: 'Dr. Moaz', callsign: 'ARES-04', department: 'CREW MEDICINE',
        summary: 'Dr. Moaz watches for exhaustion and injuries when oxygen, water, or food become scarce. Medical rounds and healthier living conditions help the team recover over time.',
        expertise: ['Crew wellbeing', 'Health checks', 'Recovery planning'],
        quote: 'Our most valuable resource is each other.',
        accent: '#efb2cf', portrait: 'assets/crew/portraits/moaz.webp',
    },
    {
        name: 'Scientist Magdy', callsign: 'ARES-05', department: 'RESEARCH & AGRICULTURE',
        summary: 'Scientist Magdy runs experiments to improve crop growth and understand the surrounding Martian environment. Research, greenhouses, and careful water use support long-term survival.',
        expertise: ['Greenhouse systems', 'Laboratory analysis', 'Food security'],
        quote: 'Every discovery can keep the next generation alive.',
        accent: '#aca5ed', portrait: 'assets/crew/portraits/magdy.webp',
    },
    {
        name: 'Mostafa', callsign: 'ARES-06', department: 'ENGINEERING SPECIALIST',
        summary: 'Mostafa is the colony’s specialist for maintenance and complex upgrades. When assigned, he leaves his patrol route, travels to the selected structure, and stays at the worksite until the job is finished.',
        expertise: ['Mechanical systems', 'Building upgrades', 'Emergency maintenance'],
        quote: 'If it can be repaired, we keep going.',
        accent: '#f7cf94', portrait: 'assets/crew/portraits/mostafa.webp',
    },
];
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const baseHeartRates = [68, 73, 75, 67, 70, 72];
const baseAnxieties = [12, 15, 17, 11, 14, 16];
/** Stable estimates updated by game Sol, oxygen/water reserves, crisis, injury and assignments. */
function getCrewVitals(state, name) {
    const member = state.crew.find(c => c.name === name);
    const index = Math.max(0, exports.crewDossiers.findIndex(c => c.name === name));
    const health = clamp(Number.isFinite(member?.health) ? member.health : 0, 0, 100);
    const oxygenPressure = state.resources.oxygen < 35;
    const waterPressure = state.resources.water < 30;
    const oxygenStress = clamp((40 - state.resources.oxygen) / 40, 0, 1);
    const waterStress = clamp((35 - state.resources.water) / 35, 0, 1);
    const injury = (100 - health) / 100;
    const crisis = state.pendingCrisis !== null;
    const job = state.upgradeJobs.find(j => j.workerName === name);
    const target = job ? state.buildings.find(b => b.id === job.buildingId) : undefined;
    const activeJob = job ? `Engineering assignment · ${target ? target.type.replace(/\b\w/g, s => s.toUpperCase()) : 'facility'} → Level ${job.targetLevel} · ${job.remainingSols} sol${job.remainingSols === 1 ? '' : 's'} left` : null;
    const variation = ((state.sol * 7 + index * 3) % 9) - 4;
    const heartRate = health === 0 ? 0 : Math.round(clamp(baseHeartRates[index] + oxygenStress * 28 + waterStress * 15 + injury * 23 + (crisis ? 15 : 0) + (job ? 7 : 0) + variation, 48, 160));
    const anxiety = health === 0 ? 0 : Math.round(clamp(baseAnxieties[index] + oxygenStress * 34 + waterStress * 27 + injury * 31 + (crisis ? 23 : 0) + (job ? 6 : 0) + Math.max(0, variation), 0, 100));
    const overall = health === 0 ? 'INCAPACITATED' : (health < 35 || anxiety >= 75 || heartRate >= 120) ? 'CRITICAL' : (health < 65 || anxiety >= 50 || heartRate >= 95) ? 'UNDER STRAIN' : 'STABLE';
    const observation = health === 0 ? 'Crew member cannot work. Complete medical tasks and stabilize life-support conditions.' :
        oxygenPressure && waterPressure ? 'Oxygen and water are running low. Collect both supplies immediately.' :
            oxygenPressure ? 'Low oxygen reserves are increasing physical and mental strain. Collect generator output.' :
                waterPressure ? 'Water reserves are low. Collect recycled water and reduce consumption.' :
                    crisis ? 'Emergency conditions are elevating stress. Resolve the active colony alert.' :
                        health < 60 ? 'Recovery is needed. Complete medical rounds and keep supplies stable.' :
                            job ? 'Working on an assigned building upgrade. Monitor supplies during construction.' :
                                'Conditions are stable. Continue monitoring supplies and daily crew wellbeing.';
    return {
        heartRate, anxiety, health,
        heartLabel: health === 0 ? 'NO READING' : heartRate >= 105 ? 'ELEVATED' : heartRate >= 92 ? 'BUSY / HIGH' : 'NORMAL',
        anxietyLabel: health === 0 ? 'NO READING' : anxiety >= 75 ? 'HIGH' : anxiety >= 45 ? 'MODERATE' : 'LOW',
        overall, observation, oxygenPressure, waterPressure, activeJob,
    };
}
/** The existing game stores exactly these six crew, ordered independently of any portrait styling. */
function getCrewDossier(member) {
    return exports.crewDossiers.find(c => c.name === member.name);
}

};
registry["./crewRoutes"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crewWalkRoutes = crewWalkRoutes;
exports.crewMotionPaths = crewMotionPaths;
exports.crewUpgradeRoute = crewUpgradeRoute;
exports.crewUpgradeMotionPath = crewUpgradeMotionPath;
const game_js_1 = require("./game.js");
const mapMath_js_1 = require("./mapMath.js");
const starts = [{ x: 4, y: 8 }, { x: 5, y: 8 }, { x: 8, y: 8 }, { x: 11, y: 7 }, { x: 5, y: 12 }, { x: 12, y: 12 }];
/** Deterministic short walking loops that avoid occupied building plots. */
function crewWalkRoutes(state) {
    const blocked = new Set(state.buildings.flatMap(game_js_1.tilesOccupied));
    const free = (x, y) => x >= 0 && x < game_js_1.GRID_W && y >= 0 && y < game_js_1.GRID_H && !blocked.has(`${x},${y}`);
    const all = [];
    for (let y = 0; y < game_js_1.GRID_H; y++)
        for (let x = 0; x < game_js_1.GRID_W; x++)
            if (free(x, y))
                all.push({ x, y });
    return starts.map((want, i) => {
        if (!all.length)
            return [{ x: 0, y: 0 }];
        const start = all.reduce((best, p) => Math.abs(p.x - want.x) + Math.abs(p.y - want.y) < Math.abs(best.x - want.x) + Math.abs(best.y - want.y) ? p : best, all[0]);
        const path = [start];
        let previous = null;
        for (let step = 0; step < 5; step++) {
            const point = path[path.length - 1];
            const adjacent = [{ x: point.x + 1, y: point.y }, { x: point.x, y: point.y + 1 }, { x: point.x - 1, y: point.y }, { x: point.x, y: point.y - 1 }].filter(p => free(p.x, p.y) && (!previous || p.x !== previous.x || p.y !== previous.y));
            if (!adjacent.length)
                break;
            const next = adjacent[(i + step * 3) % adjacent.length];
            previous = point;
            path.push(next);
        }
        return [...path, ...path.slice(0, -1).reverse()];
    });
}
function crewMotionPaths(state) {
    return crewWalkRoutes(state).map(route => route.map((tile, i) => { const p = (0, mapMath_js_1.tileToPixel)(tile.x, tile.y); return `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`; }).join(' '));
}
/** Plot a clear walk from an engineer's patrol origin to a free tile adjacent to a facility. */
function crewUpgradeRoute(state, buildingId, crewIndex) {
    const target = state.buildings.find(b => b.id === buildingId);
    const startRoute = crewWalkRoutes(state)[Math.max(0, Math.min(starts.length - 1, crewIndex))] || [];
    if (!target || !startRoute.length)
        return [];
    const blocked = new Set(state.buildings.flatMap(game_js_1.tilesOccupied));
    const valid = (x, y) => x >= 0 && x < game_js_1.GRID_W && y >= 0 && y < game_js_1.GRID_H && !blocked.has(`${x},${y}`);
    const [tw, th] = target.type === 'ark' ? [3, 3] : [2, 2];
    const exits = [];
    for (let x = target.x - 1; x <= target.x + tw; x++)
        for (let y = target.y - 1; y <= target.y + th; y++) {
            if (!valid(x, y))
                continue;
            const adjacent = (x >= target.x && x < target.x + tw) && (y === target.y - 1 || y === target.y + th)
                || (y >= target.y && y < target.y + th) && (x === target.x - 1 || x === target.x + tw);
            if (adjacent)
                exits.push({ x, y });
        }
    if (!exits.length)
        return startRoute.slice(0, 1);
    const source = startRoute[0];
    const k = (p) => `${p.x},${p.y}`;
    const queue = [source], previous = new Map([[k(source), null]]);
    let best = null;
    const goal = new Set(exits.map(k));
    for (let i = 0; i < queue.length; i++) {
        const at = queue[i];
        if (goal.has(k(at))) {
            best = at;
            break;
        }
        for (const next of [{ x: at.x + 1, y: at.y }, { x: at.x - 1, y: at.y }, { x: at.x, y: at.y + 1 }, { x: at.x, y: at.y - 1 }]) {
            if (!valid(next.x, next.y) || previous.has(k(next)))
                continue;
            previous.set(k(next), at);
            queue.push(next);
        }
    }
    if (!best)
        return startRoute.slice(0, 1);
    const reversed = [];
    for (let v = best; v; v = previous.get(k(v)) ?? null)
        reversed.push(v);
    return reversed.reverse();
}
function crewUpgradeMotionPath(state, buildingId, crewIndex) {
    const tiles = crewUpgradeRoute(state, buildingId, crewIndex);
    return tiles.map((tile, i) => { const p = (0, mapMath_js_1.tileToPixel)(tile.x, tile.y); return `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`; }).join(' ');
}

};
registry["./game"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreState = exports.saveKey = exports.advanceSol = exports.completeDailyMission = exports.resolveCrisis = exports.crisisText = exports.getProduction = exports.salvage = exports.getSalvageYield = exports.collectAll = exports.collectBuilding = exports.removeBuilding = exports.moveBuilding = exports.progressUpgradeJobs = exports.upgradeBuilding = exports.upgradeCost = exports.placeBuilding = exports.getStoredTotal = exports.getBuildingOutput = exports.canAfford = exports.canPlace = exports.tilesOccupied = exports.buildingFootprint = exports.startingState = exports.dailyQuests = exports.initialCrew = exports.buildOrder = exports.catalog = exports.storageCaps = exports.END_SOL = exports.GRID_H = exports.GRID_W = exports.availableEngineer = exports.activeUpgrade = exports.levelMultiplier = exports.upgradeDuration = exports.engineerPriority = exports.MAX_BUILDING_LEVEL = void 0;
exports.getDailyQuest = getDailyQuest;
exports.isQuestComplete = isQuestComplete;
exports.MAX_BUILDING_LEVEL = 5;
exports.engineerPriority = ['Mostafa', 'Taim', 'Abdo'];
const upgradeDuration = (building) => building.level <= 2 ? 2 : 3;
exports.upgradeDuration = upgradeDuration;
const levelMultiplier = (level) => 1 + Math.max(0, Math.min(exports.MAX_BUILDING_LEVEL, level) - 1) * 0.5;
exports.levelMultiplier = levelMultiplier;
const activeUpgrade = (state, id) => state.upgradeJobs.find(job => job.buildingId === id);
exports.activeUpgrade = activeUpgrade;
const availableEngineer = (state) => exports.engineerPriority.find(name => state.crew.some(c => c.name === name && c.health > 0) && !state.upgradeJobs.some(job => job.workerName === name)) ?? null;
exports.availableEngineer = availableEngineer;
exports.GRID_W = 16;
exports.GRID_H = 14;
exports.END_SOL = 30;
exports.storageCaps = { oxygen: 180, water: 180, food: 180, energy: 220, metal: 240 };
exports.catalog = {
    ark: { title: 'Command Dome', description: 'Weso directs the six-person colony from the command center.', cost: {}, icon: '⌂', color: '#edb785', image: 'assets/buildings/habitat.png', group: 'Starting Base', science: 'Fictional pressurized command hub.' },
    solar: { title: 'Solar Panels', description: 'Generates up to +14 power per sol. Storms reduce output.', cost: { metal: 22 }, icon: '☀', color: '#88caf2', image: 'assets/buildings/solar.png', group: 'Base & Safety', science: 'Solar output and storm reductions are illustrative.' },
    oxygen: { title: 'Oxygen Generator', description: 'Stores +11 oxygen per sol. Collect it to refill your main supply.', cost: { metal: 27 }, icon: 'O₂', color: '#93e5c5', image: 'assets/buildings/oxygen.png', group: 'Life Support', science: 'Inspired by MOXIE, with fictional production rates.' },
    recycler: { title: 'Water Recycler', description: 'Stores +7 water per sol. Collect the water to refill reserves.', cost: { metal: 25 }, icon: '◉', color: '#85ccef', image: 'assets/buildings/recycler.png', group: 'Life Support', science: 'Fictional recycling yields; not water creation.' },
    greenhouse: { title: 'Greenhouse', description: 'Produces +8 food per sol. Consumes some water and energy.', cost: { metal: 28 }, icon: '✿', color: '#c1db83', image: 'assets/buildings/greenhouse.png', group: 'Life Support', science: 'Food growth cycles are simplified game rules.' },
    habitat: { title: 'Habitat', description: 'Improves rest and lets the crew recover gradually.', cost: { metal: 24 }, icon: '⌂', color: '#f5c7a0', image: 'assets/buildings/habitat.png', group: 'Base & Safety', science: 'Pressurized habitats are fictional in this game.' },
    shelter: { title: 'Radiation Shelter', description: 'Reduces damage in solar-radiation emergencies.', cost: { metal: 24 }, icon: '⬡', color: '#f3b58a', image: 'assets/buildings/shelter.png', group: 'Base & Safety', science: 'Fictional radiation mechanics.' },
    landing: { title: 'Landing Pad', description: 'Serves as a shuttle cargo platform and logistics site.', cost: { metal: 38 }, icon: '✈', color: '#f2b58c', image: 'assets/buildings/landing-pad.png', group: 'Base & Safety', science: 'Imaginary colony landing facility.' },
    rover: { title: 'Rover Garage', description: 'Increases daily scavenged scrap from 16 to 24.', cost: { metal: 32 }, icon: '⚒', color: '#f4c089', image: 'assets/buildings/rover-bay.png', group: 'Base & Safety', science: 'Fictional salvage capability.' },
    comms: { title: 'Communications Array', description: 'Enables signal scans and mission support.', cost: { metal: 30 }, icon: '⌁', color: '#9cdeee', image: 'assets/buildings/comms.png', group: 'Base & Safety', science: 'Imaginary antenna and receiver.' },
    research: { title: 'Science Laboratory', description: 'Improves food yield and supports research missions.', cost: { metal: 34 }, icon: '✦', color: '#b9e1f7', image: 'assets/buildings/research.png', group: 'Base & Safety', science: 'Fictional lab effects.' },
};
exports.buildOrder = ['oxygen', 'recycler', 'greenhouse', 'solar', 'habitat', 'shelter', 'landing', 'rover', 'comms', 'research'];
exports.initialCrew = [
    { name: 'Weso', role: 'Captain · Colony commander', health: 100 },
    { name: 'Taim', role: 'Engineer · Field systems', health: 100 },
    { name: 'Abdo', role: 'Explorer & builder', health: 100 },
    { name: 'Dr. Moaz', role: 'Medical officer', health: 100 },
    { name: 'Scientist Magdy', role: 'Research & food systems', health: 100 },
    { name: 'Mostafa', role: 'Engineering specialist', health: 100 },
];
// Each sol has a unique, single-button task. Missions are optional: they never
// lock the Next Sol button, but they provide useful resource / medical rewards.
exports.dailyQuests = [
    { sol: 1, title: 'Search the Landing Crates', detail: 'Send the crew to recover construction materials.', kind: 'field' },
    { sol: 2, title: 'First Breath', detail: 'Collect fresh oxygen from the generator.', kind: 'oxygen' },
    { sol: 3, title: 'Water for Everyone', detail: 'Collect purified water from the recycler.', kind: 'water' },
    { sol: 4, title: 'Calibrate the Power Grid', detail: 'Inspect power routing and stabilize the array.', kind: 'systems' },
    { sol: 5, title: 'Seed the Greenhouse', detail: 'Tend the hydroponic beds for an extra harvest.', kind: 'greenhouse' },
    { sol: 6, title: 'Prepare the Dust Shields', detail: 'Reinforce vulnerable colony seals.', kind: 'repair' },
    { sol: 7, title: 'Crew Medical Rounds', detail: 'Dr. Moaz checks each survivor after the storm.', kind: 'medical' },
    { sol: 8, title: 'Atmosphere Storage Test', detail: 'Store and collect a fresh oxygen reserve.', kind: 'oxygen' },
    { sol: 9, title: 'Jezero Sample Sweep', detail: 'Survey the rock layers around the base.', kind: 'survey' },
    { sol: 10, title: 'Listen for Earth', detail: 'Run a communications-array signal check.', kind: 'signal' },
    { sol: 11, title: 'Water-Line Calibration', detail: 'Recover and inspect recycled water supplies.', kind: 'water' },
    { sol: 12, title: 'Improve the Crops', detail: 'Test a new nutrient mix in the greenhouse.', kind: 'science' },
    { sol: 13, title: 'Repair the Broken Valve', detail: 'Secure the pipelines after the leak.', kind: 'repair' },
    { sol: 14, title: 'Resupply the Work Crew', detail: 'Scavenge another batch of useful metal.', kind: 'field' },
    { sol: 15, title: 'Power-System Check', detail: 'Balance power cells before the next shift.', kind: 'systems' },
    { sol: 16, title: 'Crew Recovery Day', detail: 'Treat strain, exhaustion, and dehydration.', kind: 'medical' },
    { sol: 17, title: 'Air Purity Audit', detail: 'Collect oxygen for the emergency reserves.', kind: 'oxygen' },
    { sol: 18, title: 'Greenhouse Harvest', detail: 'Bring fresh food into the habitat.', kind: 'greenhouse' },
    { sol: 19, title: 'Ridge Mapping', detail: 'Map a safe route through the nearby ridges.', kind: 'survey' },
    { sol: 20, title: 'Mid-Mission Report', detail: 'Transmit an updated science report.', kind: 'signal' },
    { sol: 21, title: 'Radiation Safety Drill', detail: 'Check sealed suits and shelter fittings.', kind: 'repair' },
    { sol: 22, title: 'Replenish Water Tanks', detail: 'Collect another batch of purified water.', kind: 'water' },
    { sol: 23, title: 'Lab Microbiology Review', detail: 'Run a crop and water contamination test.', kind: 'science' },
    { sol: 24, title: 'Generator Output Check', detail: 'Recover oxygen before the next crew rotation.', kind: 'oxygen' },
    { sol: 25, title: 'Final Cargo Search', detail: 'Search the nearby landing debris.', kind: 'field' },
    { sol: 26, title: 'Pressure-Seal Maintenance', detail: 'Inspect all command-hub connections.', kind: 'repair' },
    { sol: 27, title: 'Crew Health Clearance', detail: 'Prepare every survivor for the final push.', kind: 'medical' },
    { sol: 28, title: 'Final Reservoir Test', detail: 'Collect water for the next expedition.', kind: 'water' },
    { sol: 29, title: 'Final Science Transmission', detail: 'Send the last research packet to the archive.', kind: 'signal' },
    { sol: 30, title: 'The First Colony', detail: 'Complete one final power-grid safety inspection.', kind: 'systems' },
];
function getDailyQuest(state) { return exports.dailyQuests[Math.min(exports.END_SOL, Math.max(1, state.sol)) - 1]; }
function isQuestComplete(state) { return state.questCompletedSols.includes(state.sol); }
// The starter base has wide walkways between separate 2×2 building plots.
const startingState = () => ({
    sol: 1,
    resources: { oxygen: 120, water: 117, food: 108, energy: 138, metal: 110 },
    crew: exports.initialCrew.map(c => ({ ...c })),
    buildings: [
        { id: 1, type: 'ark', x: 6, y: 4, level: 1 },
        { id: 2, type: 'landing', x: 1, y: 2, level: 1 },
        { id: 3, type: 'comms', x: 12, y: 1, level: 1 },
        { id: 4, type: 'solar', x: 3, y: 5, level: 1 },
        { id: 5, type: 'solar', x: 13, y: 5, level: 1 },
        { id: 6, type: 'greenhouse', x: 2, y: 9, level: 1 },
        { id: 7, type: 'recycler', x: 6, y: 10, level: 1 },
        { id: 8, type: 'oxygen', x: 9, y: 9, level: 1 },
        { id: 9, type: 'habitat', x: 11, y: 4, level: 1 },
        { id: 10, type: 'shelter', x: 13, y: 9, level: 1 },
        { id: 11, type: 'research', x: 9, y: 1, level: 1 },
        { id: 12, type: 'rover', x: 0, y: 6, level: 1 },
    ],
    nextId: 13,
    upgradeJobs: [],
    buildingStores: { 7: { oxygen: 0, water: 7 }, 8: { oxygen: 11, water: 0 } },
    collectedToday: { oxygen: 0, water: 0 },
    questCompletedSols: [],
    dustDays: 0, pendingCrisis: null, crisisHistory: [],
    log: [{ day: 1, message: 'Captain Weso and all six survivors are on Mars. Collect oxygen and water, complete daily tasks, and keep the colony healthy for 30 sols.', kind: 'good' }],
    status: 'playing', ending: '', salvagedToday: false,
});
exports.startingState = startingState;
const round = (n) => Math.round(n * 10) / 10;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const note = (state, message, kind = 'info') => ({ ...state, log: [{ day: state.sol, message, kind }, ...state.log].slice(0, 20) });
const buildingFootprint = (type) => type === 'ark' ? [3, 3] : [2, 2];
exports.buildingFootprint = buildingFootprint;
const tilesOccupied = (b) => { const [w, h] = (0, exports.buildingFootprint)(b.type); return Array.from({ length: w * h }, (_, i) => `${b.x + i % w},${b.y + Math.floor(i / w)}`); };
exports.tilesOccupied = tilesOccupied;
const canPlace = (state, type, x, y, ignoreBuildingId) => {
    const [w, h] = (0, exports.buildingFootprint)(type);
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x + w > exports.GRID_W || y + h > exports.GRID_H)
        return false;
    const occupied = new Set(state.buildings.filter(b => b.id !== ignoreBuildingId).flatMap(exports.tilesOccupied));
    for (let dx = 0; dx < w; dx++)
        for (let dy = 0; dy < h; dy++)
            if (occupied.has(`${x + dx},${y + dy}`))
                return false;
    return true;
};
exports.canPlace = canPlace;
const canAfford = (state, cost) => Object.entries(cost).every(([k, v]) => state.resources[k] >= (v || 0));
exports.canAfford = canAfford;
const getBuildingOutput = (building) => ({
    oxygen: building.type === 'oxygen' ? round(11 * (0, exports.levelMultiplier)(building.level)) : 0,
    water: building.type === 'recycler' ? round(7 * (0, exports.levelMultiplier)(building.level)) : 0,
});
exports.getBuildingOutput = getBuildingOutput;
const getStoredTotal = (state) => state.buildings.reduce((sum, b) => ({ oxygen: round(sum.oxygen + (state.buildingStores[b.id]?.oxygen || 0)), water: round(sum.water + (state.buildingStores[b.id]?.water || 0)) }), { oxygen: 0, water: 0 });
exports.getStoredTotal = getStoredTotal;
const placeBuilding = (state, type, x, y) => {
    if (state.status !== 'playing' || state.pendingCrisis || type === 'ark' || !(0, exports.canPlace)(state, type, x, y))
        return state;
    if (!(0, exports.canAfford)(state, exports.catalog[type].cost))
        return note(state, `Not enough scrap for ${exports.catalog[type].title}. Try scavenging.`, 'warn');
    const metal = state.resources.metal - (exports.catalog[type].cost.metal || 0);
    const id = state.nextId;
    return note({ ...state, resources: { ...state.resources, metal }, buildings: [...state.buildings, { id, type, x, y, level: 1 }], nextId: id + 1, buildingStores: { ...state.buildingStores, [id]: { oxygen: 0, water: 0 } } }, `${exports.catalog[type].title} was built on the new plot.`, 'good');
};
exports.placeBuilding = placeBuilding;
const upgradeCost = (b) => ({ metal: 18 + (b.level - 1) * 12 });
exports.upgradeCost = upgradeCost;
/** Queues a multi-sol engineering assignment; the actual level changes only when finished. */
const upgradeBuilding = (state, id) => {
    const b = state.buildings.find(item => item.id === id);
    if (!b || b.type === 'ark' || b.level >= exports.MAX_BUILDING_LEVEL || state.pendingCrisis || state.status !== 'playing' || (0, exports.activeUpgrade)(state, id))
        return state;
    const worker = (0, exports.availableEngineer)(state);
    if (!worker)
        return note(state, 'All available engineers are busy or injured. Wait for a worker to become free.', 'warn');
    const duration = (0, exports.upgradeDuration)(b);
    if (state.sol + duration > exports.END_SOL)
        return note(state, 'Not enough sols remain to finish this upgrade before mission end.', 'warn');
    if (!(0, exports.canAfford)(state, (0, exports.upgradeCost)(b)))
        return note(state, 'Not enough scrap for an upgrade.', 'warn');
    const job = { buildingId: id, workerName: worker, targetLevel: b.level + 1, startedSol: state.sol, totalSols: duration, remainingSols: duration };
    return note({ ...state, resources: { ...state.resources, metal: state.resources.metal - ((0, exports.upgradeCost)(b).metal || 0) }, upgradeJobs: [...state.upgradeJobs, job] }, `${worker} dispatched to upgrade ${exports.catalog[b.type].title} to Level ${job.targetLevel}. Estimated time: ${duration} sols.`, 'good');
};
exports.upgradeBuilding = upgradeBuilding;
/** Workers travel to their assigned buildings, then spend sols completing the job. */
const progressUpgradeJobs = (state, crew) => {
    const remainingJobs = [];
    const completed = [], paused = [];
    let buildings = state.buildings;
    const occupied = new Set();
    for (const job of state.upgradeJobs) {
        const target = buildings.find(b => b.id === job.buildingId);
        if (!target)
            continue;
        let worker = job.workerName;
        if (!crew.some(c => c.name === worker && c.health > 0) || occupied.has(worker)) {
            worker = exports.engineerPriority.find(name => !occupied.has(name) && crew.some(c => c.name === name && c.health > 0)) || '';
        }
        if (!worker) {
            remainingJobs.push(job);
            paused.push(`${exports.catalog[target.type].title}: waiting for a healthy engineer`);
            continue;
        }
        occupied.add(worker);
        const updated = { ...job, workerName: worker, remainingSols: job.remainingSols - 1 };
        if (updated.remainingSols > 0) {
            remainingJobs.push(updated);
            continue;
        }
        buildings = buildings.map(b => b.id === job.buildingId ? { ...b, level: Math.min(exports.MAX_BUILDING_LEVEL, job.targetLevel) } : b);
        completed.push(`${worker} finished ${exports.catalog[target.type].title} Level ${job.targetLevel}`);
    }
    return { buildings, upgradeJobs: remainingJobs, completed, paused };
};
exports.progressUpgradeJobs = progressUpgradeJobs;
const moveBuilding = (state, id, x, y) => {
    const b = state.buildings.find(item => item.id === id);
    if (!b || b.type === 'ark' || (0, exports.activeUpgrade)(state, id) || state.pendingCrisis || state.status !== 'playing' || (b.x === x && b.y === y) || !(0, exports.canPlace)(state, b.type, x, y, id))
        return state;
    return note({ ...state, buildings: state.buildings.map(item => item.id === id ? { ...item, x, y } : item) }, `${exports.catalog[b.type].title} moved safely to an open plot.`, 'good');
};
exports.moveBuilding = moveBuilding;
const removeBuilding = (state, id) => {
    const b = state.buildings.find(item => item.id === id);
    if (!b || b.type === 'ark' || (0, exports.activeUpgrade)(state, id) || state.pendingCrisis || state.status !== 'playing')
        return state;
    const refund = Math.max(6, Math.round((exports.catalog[b.type].cost.metal || 0) * .5));
    const stores = { ...state.buildingStores };
    delete stores[id];
    return note({ ...state, buildingStores: stores, resources: { ...state.resources, metal: clamp(state.resources.metal + refund, 0, exports.storageCaps.metal) }, buildings: state.buildings.filter(item => item.id !== id) }, `${exports.catalog[b.type].title} dismantled. +${refund} scrap recovered.`, 'warn');
};
exports.removeBuilding = removeBuilding;
const collectBuilding = (state, id) => {
    if (state.status !== 'playing' || state.pendingCrisis)
        return state;
    const b = state.buildings.find(item => item.id === id);
    if (!b || !['oxygen', 'recycler'].includes(b.type))
        return state;
    const type = b.type === 'oxygen' ? 'oxygen' : 'water';
    const stored = state.buildingStores[id]?.[type] || 0;
    const taken = round(Math.min(stored, exports.storageCaps[type] - state.resources[type]));
    if (taken <= 0)
        return state;
    const stores = { ...state.buildingStores, [id]: { ...(state.buildingStores[id] || { oxygen: 0, water: 0 }), [type]: round(stored - taken) } };
    return note({ ...state, buildingStores: stores, resources: { ...state.resources, [type]: round(state.resources[type] + taken) }, collectedToday: { ...state.collectedToday, [type]: round(state.collectedToday[type] + taken) } }, `Collected +${taken} ${type} from ${exports.catalog[b.type].title}.`, 'good');
};
exports.collectBuilding = collectBuilding;
const collectAll = (state) => {
    if (state.status !== 'playing' || state.pendingCrisis)
        return state;
    let next = state, total = 0;
    for (const b of state.buildings) {
        if (b.type !== 'oxygen' && b.type !== 'recycler')
            continue;
        const before = next.resources.oxygen + next.resources.water;
        next = (0, exports.collectBuilding)(next, b.id);
        total += next.resources.oxygen + next.resources.water - before;
    }
    if (total <= 0)
        return state;
    return note(next, `Supply transfer complete: +${round(total)} oxygen and water collected.`, 'good');
};
exports.collectAll = collectAll;
/** Higher-level rover garages improve the value of field salvage. */
const getSalvageYield = (state) => {
    const roverLevels = state.buildings.filter(b => b.type === 'rover').map(b => b.level);
    return roverLevels.length ? 24 + (Math.max(...roverLevels) - 1) * 4 : 16;
};
exports.getSalvageYield = getSalvageYield;
const salvage = (state) => {
    if (state.status !== 'playing' || state.pendingCrisis || state.salvagedToday)
        return state;
    if (state.resources.oxygen < 3 || state.resources.water < 3)
        return note(state, 'Scavenging requires 3 oxygen and 3 water.', 'warn');
    const gain = (0, exports.getSalvageYield)(state);
    return note({ ...state, salvagedToday: true, resources: { ...state.resources, oxygen: round(state.resources.oxygen - 3), water: round(state.resources.water - 3), metal: clamp(state.resources.metal + gain, 0, exports.storageCaps.metal) } }, `Abdo, Taim and Mostafa recovered +${gain} scrap.`, 'good');
};
exports.salvage = salvage;
const getProduction = (state) => {
    const alive = state.crew.filter(c => c.health > 0).length;
    const flow = { oxygen: -alive * 1.2, water: -alive * .85, food: -alive * .85, energy: -3, metal: 0 };
    for (const b of state.buildings) {
        const mult = (0, exports.levelMultiplier)(b.level);
        switch (b.type) {
            case 'solar':
                flow.energy += (state.dustDays > 0 ? 5 : 14) * mult;
                break;
            case 'oxygen':
                flow.oxygen += 11 * mult;
                flow.energy -= 3 * mult;
                break;
            case 'recycler':
                flow.water += 7 * mult;
                flow.energy -= 2 * mult;
                break;
            case 'greenhouse':
                flow.food += 8 * mult;
                flow.water -= 1 * mult;
                flow.energy -= 3 * mult;
                break;
            case 'research':
                flow.food += 2 * mult;
                flow.energy -= 2;
                break;
            case 'landing':
                flow.metal += round((b.level - 1) * 1.5);
                flow.energy -= 1;
                break;
            case 'habitat':
            case 'shelter':
            case 'rover':
            case 'comms':
                flow.energy -= 1;
                break;
        }
    }
    return Object.fromEntries(Object.entries(flow).map(([k, v]) => [k, round(v)]));
};
exports.getProduction = getProduction;
exports.crisisText = {
    dust: { title: 'DUST STORM', description: 'Dust darkens the sky and reduces solar generation for two sols.', first: 'Protect the power cells · −5 energy', second: 'Clean the panels · −8 scrap' },
    leak: { title: 'WATER LEAK', description: 'A pipe has cracked. Repair it or sacrifice stored water.', first: 'Repair pipe · −9 scrap', second: 'Ration the water · −10 water' },
    radiation: { title: 'SOLAR WARNING', description: 'Radiation requires a safety decision. A shelter lowers the risk.', first: 'Shelter in place · −6 energy', second: 'Finish outdoor work · crew injury' },
    fracture: { title: 'HABITAT DAMAGE', description: 'A pressure valve is failing and the crew needs to react.', first: 'Patch the valve · −12 scrap', second: 'Seal section · −11 oxygen' },
};
const incidentDays = { 6: 'dust', 13: 'leak', 21: 'radiation', 26: 'fracture' };
const resolveCrisis = (state, choice) => {
    const crisis = state.pendingCrisis;
    if (!crisis || state.status !== 'playing')
        return state;
    const resources = { ...state.resources };
    let crew = state.crew.map(c => ({ ...c }));
    let dustDays = state.dustDays;
    let message = '';
    switch (crisis) {
        case 'dust':
            dustDays = 2;
            if (choice === 0) {
                resources.energy -= 5;
                message = 'Emergency power cells protected.';
            }
            else {
                resources.metal -= 8;
                message = 'Dust filters cleaned.';
            }
            break;
        case 'leak':
            if (choice === 0) {
                resources.metal -= 9;
                message = 'Water line repaired.';
            }
            else {
                resources.water -= 10;
                message = 'Water rationed after pipe damage.';
            }
            break;
        case 'radiation':
            if (choice === 0) {
                resources.energy -= 6;
                message = 'Crew took shelter.';
            }
            else {
                const shield = Math.max(0, ...state.buildings.filter(b => b.type === 'shelter').map(b => b.level));
                const injury = shield ? Math.max(0, 4 - shield) : 9;
                crew = crew.map(c => ({ ...c, health: clamp(c.health - injury, 0, 100) }));
                message = `Outdoor crew exposure: ${injury} health loss after shelter shielding.`;
            }
            break;
        case 'fracture':
            if (choice === 0) {
                resources.metal -= 12;
                message = 'Taim and Mostafa sealed the pressure valve.';
            }
            else {
                resources.oxygen -= 11;
                message = 'Oxygen lost while sealing the section.';
            }
            break;
    }
    for (const key of Object.keys(resources))
        resources[key] = clamp(round(resources[key]), 0, exports.storageCaps[key]);
    return note({ ...state, resources, crew, pendingCrisis: null, dustDays, crisisHistory: [...state.crisisHistory, crisis] }, message, 'warn');
};
exports.resolveCrisis = resolveCrisis;
const completeDailyMission = (state) => {
    if (state.status !== 'playing' || state.pendingCrisis || isQuestComplete(state))
        return state;
    const q = getDailyQuest(state);
    let next = state;
    if (q.kind === 'oxygen' || q.kind === 'water') {
        next = (0, exports.collectAll)(state);
        const kind = q.kind === 'oxygen' ? 'oxygen' : 'water';
        if (next.collectedToday[kind] < 4)
            return note(next, `Mission needs 4 ${kind} collected this sol. Wait for the next production cycle if the tanks are empty.`, 'warn');
    }
    else if (q.kind === 'field') {
        next = (0, exports.salvage)(state);
        if (!next.salvagedToday)
            return note(next, 'Scavenge for scrap to complete this mission.', 'warn');
    }
    else {
        const cost = {};
        if (q.kind === 'systems')
            cost.energy = 4;
        if (q.kind === 'repair')
            cost.metal = 4;
        if (q.kind === 'medical')
            cost.water = 4;
        if (q.kind === 'science')
            cost.energy = 4;
        if (q.kind === 'signal')
            cost.energy = 3;
        if (q.kind === 'greenhouse')
            cost.water = 3;
        if (q.kind === 'survey')
            cost.energy = 3;
        if (!(0, exports.canAfford)(state, cost))
            return note(state, `Need more ${Object.keys(cost).join(' / ')} to complete this daily task.`, 'warn');
        if (q.kind === 'science' && !state.buildings.some(b => b.type === 'research'))
            return note(state, 'A Science Laboratory is required for this task.', 'warn');
        if (q.kind === 'signal' && !state.buildings.some(b => b.type === 'comms'))
            return note(state, 'A Communications Array is required for this task.', 'warn');
        if (q.kind === 'greenhouse' && !state.buildings.some(b => b.type === 'greenhouse'))
            return note(state, 'Build a Greenhouse first.', 'warn');
        const resources = { ...state.resources };
        for (const [key, value] of Object.entries(cost))
            resources[key] -= value || 0;
        if (q.kind === 'systems' || q.kind === 'survey' || q.kind === 'signal') {
            const commsLevel = q.kind === 'signal' ? Math.max(1, ...state.buildings.filter(b => b.type === 'comms').map(b => b.level)) : 1;
            resources.metal = clamp(resources.metal + 6 + (commsLevel - 1) * 2, 0, exports.storageCaps.metal);
        }
        if (q.kind === 'greenhouse' || q.kind === 'science')
            resources.food = clamp(resources.food + 8, 0, exports.storageCaps.food);
        if (q.kind === 'repair')
            resources.oxygen = clamp(resources.oxygen + 6, 0, exports.storageCaps.oxygen);
        const crew = q.kind === 'medical' || q.kind === 'repair' ? state.crew.map(c => ({ ...c, health: clamp(c.health + (q.kind === 'medical' ? 8 : 2), 0, 100) })) : state.crew;
        next = { ...state, resources, crew };
    }
    return note({ ...next, questCompletedSols: [...next.questCompletedSols, next.sol] }, `Daily mission complete: ${q.title}.`, 'good');
};
exports.completeDailyMission = completeDailyMission;
const advanceSol = (state) => {
    if (state.status !== 'playing' || state.pendingCrisis)
        return state;
    if (state.sol === exports.END_SOL) {
        const active = state.crew.filter(c => c.health > 0).length;
        const lifeSupport = state.buildings.some(b => b.type === 'oxygen') && state.buildings.some(b => b.type === 'recycler');
        const won = lifeSupport && active >= 4;
        return note({ ...state, status: won ? 'won' : 'lost', ending: won ? 'Captain Weso and the crew completed 30 sols. The first colony has a future.' : 'The colony reached Sol 30 but does not have enough active crew and life-support capacity.' }, won ? 'The Last Dawn has become a new beginning.' : 'The mission ended without stable life support.', won ? 'good' : 'warn');
    }
    const flow = (0, exports.getProduction)(state);
    const allOutput = state.buildings.reduce((sum, b) => { const production = (0, exports.getBuildingOutput)(b); return { oxygen: sum.oxygen + production.oxygen, water: sum.water + production.water }; }, { oxygen: 0, water: 0 });
    const resources = { ...state.resources };
    for (const key of Object.keys(resources)) {
        const value = flow[key] - (key === 'oxygen' ? allOutput.oxygen : key === 'water' ? allOutput.water : 0);
        resources[key] = clamp(round(resources[key] + value), 0, exports.storageCaps[key]);
    }
    const stores = { ...state.buildingStores };
    for (const b of state.buildings) {
        const production = (0, exports.getBuildingOutput)(b);
        if (production.oxygen || production.water) {
            const prior = stores[b.id] || { oxygen: 0, water: 0 };
            stores[b.id] = { oxygen: clamp(round(prior.oxygen + production.oxygen), 0, 48), water: clamp(round(prior.water + production.water), 0, 42) };
        }
    }
    // Shortages damage EVERY awake crew member, including Captain Weso.
    const oxygenPenalty = resources.oxygen < 28 ? 5 + (28 - resources.oxygen) * .37 : 0;
    const waterPenalty = resources.water < 23 ? 4 + (23 - resources.water) * .32 : 0;
    const foodPenalty = resources.food < 12 ? 5 : 0;
    const powerPenalty = resources.energy < 8 ? 4 : 0;
    const damage = round(oxygenPenalty + waterPenalty + foodPenalty + powerPenalty);
    const shelterBoost = state.buildings.length ? Math.max(0, ...state.buildings.filter(b => b.type === 'habitat').map(b => 1.4 + (b.level - 1) * .8)) : 0;
    const crew = state.crew.map(c => ({ ...c, health: clamp(round(c.health - (c.health > 0 ? damage : 0) + (damage === 0 && c.health > 0 ? shelterBoost : 0)), 0, 100) }));
    const sol = state.sol + 1;
    const upgraded = (0, exports.progressUpgradeJobs)(state, crew);
    let next = { ...state, sol, crew, resources, buildings: upgraded.buildings, upgradeJobs: upgraded.upgradeJobs, buildingStores: stores, collectedToday: { oxygen: 0, water: 0 }, dustDays: Math.max(0, state.dustDays - 1), salvagedToday: false };
    if (crew.filter(c => c.health > 0).length < 4)
        return note({ ...next, status: 'lost', ending: 'Too many survivors were injured by sustained shortages. Restore oxygen and water before their health falls critically.' }, 'Critical: fewer than four crew members can work.', 'warn');
    const crisis = incidentDays[sol];
    if (crisis && !state.crisisHistory.includes(crisis)) {
        next = { ...next, pendingCrisis: crisis };
        return note(next, `Incoming alert: ${exports.crisisText[crisis].title}.`, 'warn');
    }
    if (upgraded.completed.length || upgraded.paused.length) {
        const message = [...upgraded.completed, ...upgraded.paused].join('; ');
        return note(next, `Sol ${sol}: ${message}.${damage > 0 ? ' Scarce supplies also injured the crew.' : ''}`, damage > 0 || upgraded.paused.length ? 'warn' : 'good');
    }
    if (damage > 0)
        return note(next, `Sol ${sol}: scarce supplies caused −${damage} health to EVERY crew member, including Captain Weso. Collect oxygen and water!`, 'warn');
    return note(next, `Sol ${sol}: the colony is stable. New daily mission received.`, 'info');
};
exports.advanceSol = advanceSol;
exports.saveKey = 'ares-first-colony-v6';
const legacyKey = 'ares-first-colony-v5';
/** Safely restore the last exact game state. A previous Edition 5 save is migrated. */
const restoreState = () => {
    try {
        if (typeof localStorage === 'undefined')
            return null;
        const raw = localStorage.getItem(exports.saveKey) || localStorage.getItem(legacyKey);
        if (!raw)
            return null;
        const data = JSON.parse(raw);
        if (!data || !Number.isInteger(data.sol) || data.sol < 1 || data.sol > exports.END_SOL || !Array.isArray(data.buildings) || !Array.isArray(data.crew) || !data.resources)
            return null;
        if (data.crew.length !== 6)
            return null;
        const ids = new Set(), occupied = new Set();
        const buildings = [];
        for (const b of data.buildings) {
            if (!b || !Number.isInteger(b.id) || ids.has(b.id) || !exports.catalog[b.type] || !Number.isInteger(b.x) || !Number.isInteger(b.y) || !Number.isInteger(b.level) || b.level < 1 || b.level > exports.MAX_BUILDING_LEVEL)
                return null;
            const [w, h] = (0, exports.buildingFootprint)(b.type);
            if (b.x < 0 || b.y < 0 || b.x + w > exports.GRID_W || b.y + h > exports.GRID_H)
                return null;
            for (const tile of (0, exports.tilesOccupied)(b)) {
                if (occupied.has(tile))
                    return null;
                occupied.add(tile);
            }
            ids.add(b.id);
            buildings.push(b);
        }
        const resources = {};
        for (const key of Object.keys(exports.storageCaps)) {
            const value = data.resources[key];
            if (typeof value !== 'number' || !Number.isFinite(value))
                return null;
            resources[key] = clamp(value, 0, exports.storageCaps[key]);
        }
        const base = (0, exports.startingState)();
        const stores = {};
        for (const b of buildings) {
            const source = data.buildingStores?.[b.id];
            if (source || b.type === 'oxygen' || b.type === 'recycler')
                stores[b.id] = { oxygen: clamp(Number(source?.oxygen) || 0, 0, 48), water: clamp(Number(source?.water) || 0, 0, 42) };
        }
        const crew = exports.initialCrew.map(c => { const prior = data.crew?.find(x => x?.name === c.name); return { ...c, health: clamp(Number(prior?.health ?? 100), 0, 100) }; });
        // Version 6/7 saves have no upgrade jobs; preserve their buildings and resources.
        const jobs = [];
        const reservedBuildings = new Set(), reservedWorkers = new Set();
        if (Array.isArray(data.upgradeJobs))
            for (const raw of data.upgradeJobs) {
                const job = raw;
                const target = buildings.find(b => b.id === job?.buildingId);
                if (!target || target.type === 'ark' || reservedBuildings.has(target.id) || !exports.engineerPriority.some(n => n === job.workerName) || reservedWorkers.has(job.workerName))
                    continue;
                if (!Number.isInteger(job.targetLevel) || job.targetLevel !== target.level + 1 || job.targetLevel > exports.MAX_BUILDING_LEVEL)
                    continue;
                if (!Number.isInteger(job.startedSol) || job.startedSol < 1 || job.startedSol > data.sol)
                    continue;
                if (!Number.isInteger(job.totalSols) || job.totalSols < 1 || job.totalSols > 4 || !Number.isInteger(job.remainingSols) || job.remainingSols < 1 || job.remainingSols > job.totalSols)
                    continue;
                jobs.push({ ...job });
                reservedBuildings.add(job.buildingId);
                reservedWorkers.add(job.workerName);
            }
        const status = ['playing', 'won', 'lost'].includes(data.status || '') ? data.status : 'playing';
        return { ...base, ...data, resources, buildings, crew, upgradeJobs: jobs, buildingStores: stores,
            collectedToday: { oxygen: clamp(Number(data.collectedToday?.oxygen) || 0, 0, 999), water: clamp(Number(data.collectedToday?.water) || 0, 0, 999) },
            questCompletedSols: Array.isArray(data.questCompletedSols) ? [...new Set(data.questCompletedSols.filter((n) => Number.isInteger(n) && n >= 1 && n <= 30))] : [],
            crisisHistory: Array.isArray(data.crisisHistory) ? data.crisisHistory.filter((x) => ['dust', 'leak', 'radiation', 'fracture'].includes(x)) : [],
            pendingCrisis: ['dust', 'leak', 'radiation', 'fracture'].includes(data.pendingCrisis || '') ? data.pendingCrisis : null,
            dustDays: clamp(Number(data.dustDays) || 0, 0, 5), nextId: Math.max(Number(data.nextId) || 0, ...buildings.map(b => b.id + 1), 1),
            sol: data.sol, status, log: Array.isArray(data.log) ? data.log.slice(0, 20) : base.log,
            ending: typeof data.ending === 'string' ? data.ending : '', salvagedToday: Boolean(data.salvagedToday) };
    }
    catch {
        return null;
    }
};
exports.restoreState = restoreState;

};
registry["./gameAudio"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameAudio = void 0;
const audioSettings_1 = require("./audioSettings");
const AUDIO_DIR = 'assets/audio/';
/**
 * One music player for the whole app. The score is quiet, loops on the game
 * screen only, and never overlays the voiced intro or the Sol-30 ending.
 * All playback failures (including autoplay blocking) are nonfatal.
 */
class GameAudio {
    constructor() {
        this.preferences = (0, audioSettings_1.readAudioSettings)();
        this.musicPlayer = null;
        this.gameActive = false;
        this.unlocked = false;
        this.effectsPlaying = new Set();
    }
    getSettings() { return { ...this.preferences }; }
    setSettings(settings) {
        this.preferences = { ...settings };
        (0, audioSettings_1.storeAudioSettings)(this.preferences);
        this.updateVolumes();
        this.refreshMusic();
    }
    setGameActive(playing) {
        this.gameActive = playing;
        if (!playing) {
            this.musicPlayer?.pause();
            for (const playingEffect of this.effectsPlaying) {
                playingEffect.pause();
                playingEffect.src = '';
            }
            this.effectsPlaying.clear();
        }
        else
            this.refreshMusic();
    }
    /** Call this in a pointer/key gesture to permit playback in modern browsers. */
    unlock() {
        this.unlocked = true;
        this.refreshMusic();
    }
    getMusicPlayer() {
        if (typeof Audio === 'undefined')
            return null;
        if (!this.musicPlayer) {
            const player = new Audio(AUDIO_DIR + 'mars_ambient_loop.mp3');
            player.loop = true;
            player.preload = 'auto';
            this.musicPlayer = player;
        }
        return this.musicPlayer;
    }
    updateVolumes() {
        if (this.musicPlayer)
            this.musicPlayer.volume = this.preferences.muted ? 0 : (this.preferences.volume / 100) * .32;
        for (const playingEffect of this.effectsPlaying)
            playingEffect.volume = this.preferences.muted ? 0 : (this.preferences.volume / 100) * .64;
    }
    refreshMusic() {
        if (!this.gameActive || !this.unlocked || !this.preferences.music || this.preferences.muted || this.preferences.volume === 0) {
            this.musicPlayer?.pause();
            return;
        }
        const player = this.getMusicPlayer();
        if (!player)
            return;
        player.volume = (this.preferences.volume / 100) * .32;
        if (player.paused) {
            void player.play().catch(() => { });
        }
    }
    play(sound, allowOutsideGame = false) {
        if (!allowOutsideGame && !this.gameActive)
            return;
        if (!this.preferences.effects || this.preferences.muted || this.preferences.volume === 0 || typeof Audio === 'undefined')
            return;
        if (this.effectsPlaying.size >= 7)
            return;
        const player = new Audio(AUDIO_DIR + sound + '.mp3');
        player.preload = 'auto';
        player.volume = (this.preferences.volume / 100) * .64;
        const clear = () => { player.removeEventListener('ended', clear); player.removeEventListener('error', clear); this.effectsPlaying.delete(player); };
        player.addEventListener('ended', clear);
        player.addEventListener('error', clear);
        this.effectsPlaying.add(player);
        void player.play().catch(clear);
    }
}
exports.gameAudio = new GameAudio();

};
registry["./introTimeline"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captionAt = exports.shotAt = exports.introCaptions = exports.introShots = exports.introDuration = void 0;
exports.cueAt = cueAt;
/**
 * The Last Dawn: editorial sync points against the supplied 59.89875s ElevenLabs MP3.
 * All story events are fictional. The named Jezero Crater is a real place, but these
 * illustrations are artistic storytelling, NOT NASA spacecraft or terrain imagery.
 */
exports.introDuration = 59.89875;
const dir = 'assets/cutscene/';
exports.introShots = [
    { id: 'earth-burning', image: dir + 'original-01.jpg', from: 0, to: 4.0, overlay: 'ash', zoomFrom: 1.031, zoomTo: 1.083, panX: -1, panY: 0 },
    { id: 'survivors', image: dir + 'extra-01-survivors-in-ash.jpg', from: 4.0, to: 6.9, overlay: 'ash', zoomFrom: 1.028, zoomTo: 1.008, panX: 0, panY: 0 },
    { id: 'boarding', image: dir + 'original-02.jpg', from: 6.9, to: 11.2, overlay: 'farewell', zoomFrom: 1.036, zoomTo: 1.094, panX: -1, panY: 0 },
    { id: 'last-look', image: dir + 'extra-02-last-look-back.jpg', from: 11.2, to: 16.5, overlay: 'farewell', zoomFrom: 1.028, zoomTo: 1.012, panX: 0, panY: 0 },
    { id: 'departure', image: dir + 'original-03.jpg', from: 16.5, to: 20.7, overlay: 'vacuum', zoomFrom: 1.026, zoomTo: 1.068, panX: 0, panY: -1 },
    { id: 'space-silence', image: dir + 'extra-03-silence-in-space.jpg', from: 20.7, to: 24.6, overlay: 'vacuum', zoomFrom: 1.073, zoomTo: 1.021, panX: -1, panY: 0 },
    { id: 'reactor-alert', image: dir + 'extra-04-red-alert-cockpit.jpg', from: 24.6, to: 29.1, overlay: 'warning', zoomFrom: 1.047, zoomTo: 1.088, panX: 1, panY: 0 },
    { id: 'ship-damaged', image: dir + 'original-04.jpg', from: 29.1, to: 33.4, overlay: 'warning', zoomFrom: 1.047, zoomTo: 1.104, panX: -1, panY: 0 },
    { id: 'jezero-mapped', image: dir + 'original-05.jpg', from: 33.4, to: 38.2, overlay: 'mars', zoomFrom: 1.073, zoomTo: 1.021, panX: 1, panY: 0 },
    { id: 'emergency-descent', image: dir + 'extra-05-mars-descent.jpg', from: 38.2, to: 44.5, overlay: 'descent', zoomFrom: 1.031, zoomTo: 1.099, panX: -1, panY: 0 },
    { id: 'first-footstep', image: dir + 'extra-06-first-footsteps.jpg', from: 44.5, to: 51.0, overlay: 'mars', zoomFrom: 1.022, zoomTo: 1.004, panX: 0, panY: 0 },
    { id: 'first-dawn', image: dir + 'original-06.jpg', from: 51.0, to: exports.introDuration, overlay: 'dawn', zoomFrom: 1.02, zoomTo: 1.04, panX: 0, panY: 0 },
];
/** Subtitles intentionally change in short readable phrases, never title cards. */
exports.introCaptions = [
    { from: 0, to: 3.3, text: 'I used to think Earth would always be there.' },
    { from: 3.3, to: 6.9, text: 'Then the cities went dark, and the sky followed.' },
    { from: 6.9, to: 11.5, text: 'They called us the lucky ones. Six seats on a ship meant for hundreds.' },
    { from: 11.5, to: 16.5, text: 'I still remember the faces we left behind.' },
    { from: 16.5, to: 20.4, text: 'We watched our world become a tiny blue light.' },
    { from: 20.4, to: 24.6, text: 'Nobody spoke. There was nothing left to say.' },
    { from: 24.6, to: 28.6, text: 'The reactor failed before we reached Mars.' },
    { from: 28.6, to: 30.8, text: 'Our return fuel was gone.' },
    { from: 30.8, to: 33.4, text: 'Then the last transmission from Earth disappeared.' },
    { from: 33.4, to: 38.1, text: 'I remembered Jezero Crater from the old rover maps.' },
    { from: 38.1, to: 41.3, text: 'An ancient lake, a dried river delta.' },
    { from: 41.3, to: 44.5, text: 'We aimed our wounded ship toward the crater floor.' },
    { from: 44.5, to: 47.3, text: 'Six of us survived. The air is running out.' },
    { from: 47.3, to: 50.8, text: 'The water is counted by the drop.' },
    { from: 50.8, to: 54.5, text: 'No rescue is coming.' },
    { from: 54.5, to: exports.introDuration, text: 'If this is our last sunrise... we will build another.' },
];
/** Stable time mapping: one master audio clock controls every shot and caption. */
function cueAt(cues, value) {
    if (!Number.isFinite(value) || value <= 0)
        return 0;
    for (let i = cues.length - 1; i >= 0; i--)
        if (value >= cues[i].from)
            return i;
    return 0;
}
const shotAt = (value) => cueAt(exports.introShots, value);
exports.shotAt = shotAt;
const captionAt = (value) => cueAt(exports.introCaptions, value);
exports.captionAt = captionAt;

};
registry["./main"]=function(module,exports,require){
const React=window.React;
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const App_1 = __importDefault(require("./App"));
client_1.default.createRoot(document.getElementById('root')).render(react_1.default.createElement(App_1.default, null));

};
registry["./mapMath"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tileToPixel = exports.ISO_ORIGIN_Y = exports.ISO_CENTER_X = exports.ISO_Y = exports.ISO_X = void 0;
exports.snapIsoDrag = snapIsoDrag;
/** Isometric grid stays entirely within the 1440×810 game canvas. */
exports.ISO_X = 30;
exports.ISO_Y = 14;
exports.ISO_CENTER_X = 720;
exports.ISO_ORIGIN_Y = 345;
const tileToPixel = (x, y) => ({
    x: exports.ISO_CENTER_X + (x - y) * exports.ISO_X,
    y: exports.ISO_ORIGIN_Y + (x + y) * exports.ISO_Y,
});
exports.tileToPixel = tileToPixel;
/** Convert cursor motion (SVG pixels) to map-tile motion. */
function snapIsoDrag(dx, dy) {
    if (!Number.isFinite(dx) || !Number.isFinite(dy))
        return { x: 0, y: 0 };
    return { x: Math.round((dx / exports.ISO_X + dy / exports.ISO_Y) / 2), y: Math.round((dy / exports.ISO_Y - dx / exports.ISO_X) / 2) };
}

};
registry["./nasaResources"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceForQuest = exports.researchById = exports.supportingNASAResearch = exports.nasaChallengeResources = void 0;
exports.researchForQuest = researchForQuest;
exports.nasaChallengeResources = [
    {
        id: 'open-apis', name: 'NASA Open APIs', agency: 'NASA', url: 'https://api.nasa.gov/',
        evidence: 'NASA publishes documented interfaces for open space-science information and data, including the DONKI space-weather service.',
        connection: 'The Science Atlas links to NASA data sources, while the communications and research quests teach players to consult mission evidence.',
        qualification: 'The game does not fetch NASA API responses in real time; no NASA API measurements drive the game rules.'
    },
    {
        id: 'donki', name: 'DONKI — Space Weather', agency: 'NASA Space Weather Research Center', url: 'https://api.nasa.gov/',
        evidence: 'DONKI provides searchable records and API access for solar flares, coronal mass ejections and other space-weather phenomena.',
        connection: 'Solar-warning events in ARES teach why a crew might take shelter and protect vital systems.',
        qualification: 'A DONKI event is not a prediction of astronaut dose at this fictional colony, and the game alerts are fictional.'
    },
    {
        id: 'osdr', name: 'Open Science Data Repository (OSDR)', agency: 'NASA', url: 'https://science.nasa.gov/biological-physical/data/osdr/',
        evidence: 'NASA OSDR stores biological and environmental research from space and spaceflight-like conditions, including studies relevant to muscles, bones and microbes.',
        connection: 'Crew-health and science-lab missions draw on the kinds of health and biological risks studied by NASA.',
        qualification: 'Crew health points and recovery rules are invented for play; they are not medical predictions.'
    },
    {
        id: 'radlab', name: 'RadLab — Radiation Data Portal', agency: 'NASA OSDR and contributors', url: 'https://visualization.osdr.nasa.gov/radlab/gui/overview',
        evidence: 'RadLab allows users to inspect spacecraft radiation-instrument measurements and dose-rate time series.',
        connection: 'The radiation shelter and protective decisions introduce shielding and exposure trade-offs.',
        qualification: 'The game does not model Mars-surface absorbed dose; spacecraft and ISS readings cannot be used as Mars colony readings without analysis.'
    },
    {
        id: 'mars-trek', name: 'Mars Trek', agency: 'NASA/JPL', url: 'https://trek.nasa.gov/mars/',
        evidence: 'Mars Trek gives access to Mars maps, terrain layers, elevation tools, lighting information and mission imagery.',
        connection: 'ARES is set in Jezero Crater; the exploration, survey and terrain lessons encourage learning about actual Martian geography.',
        qualification: 'The editable game grid is fictional artwork, not a downloaded or surveyed Mars Trek elevation model.'
    },
    {
        id: 'csa-food', name: 'Space Food Production Toolkit', agency: 'Canadian Space Agency', url: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
        evidence: 'The CSA toolkit covers challenges and learning activities related to growing food for space and remote environments.',
        connection: 'The greenhouse converts resources into food, introducing the need to budget energy, water and crop production.',
        qualification: 'The greenhouse yield and crop growth times are fictional game-balance rules.'
    },
];
exports.supportingNASAResearch = [
    {
        id: 'moxie', name: 'MOXIE — Oxygen from Mars CO₂', agency: 'NASA/JPL', url: 'https://www.nasa.gov/solar-system/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/',
        evidence: 'MOXIE, aboard Perseverance, produced a total of 122 grams of oxygen during 16 runs; its peak measured production was 12 grams per hour.',
        connection: 'The oxygen generator produces a collectable oxygen reserve, teaching in-situ resource utilization.',
        qualification: 'ARES uses abstract oxygen points, not 122 grams, MOXIE output, or an engineered human life-support rate.'
    },
    {
        id: 'iss-water', name: 'ISS Water-Recovery Systems', agency: 'NASA', url: 'https://www.nasa.gov/missions/station/nasa-achieves-water-recovery-milestone-on-international-space-station/',
        evidence: 'NASA reported that ISS life-support water recovery reached approximately 98% in a 2023 demonstration.',
        connection: 'The water recycler stores recovered water and must be maintained and collected by the player.',
        qualification: 'The 98% ISS result is not a tested Mars-base water-recycling rate; the in-game yield is fictional.'
    },
    {
        id: 'mars-dust', name: 'Mars Dust and Solar Power', agency: 'NASA', url: 'https://science.nasa.gov/mission/mer-spirit/',
        evidence: 'NASA reports that severe Martian dust storms reduced solar power for the Spirit and Opportunity rovers.',
        connection: 'Dust events reduce the output of colony solar panels and force the player to manage energy shortages.',
        qualification: 'Solar-energy units and storm impact percentages in ARES are not NASA-calibrated.'
    },
];
exports.researchById = Object.fromEntries([...exports.nasaChallengeResources, ...exports.supportingNASAResearch].map(x => [x.id, x]));
exports.resourceForQuest = {
    oxygen: 'moxie', water: 'iss-water', field: 'mars-trek', systems: 'mars-dust',
    medical: 'osdr', science: 'osdr', signal: 'open-apis', greenhouse: 'csa-food',
    repair: 'radlab', survey: 'mars-trek'
};
function researchForQuest(kind) {
    return exports.researchById[exports.resourceForQuest[kind]];
}

};
registry["./storyTimeline"]=function(module,exports,require){
const React=window.React;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectedNarrationDuration = exports.sceneStarts = void 0;
exports.panelForTime = panelForTime;
exports.panelStart = panelStart;
/**
 * Scene boundaries in seconds, aligned to pauses in the user-provided
 * 59.899-second ElevenLabs narration. These are editorial cue points, not
 * NASA-related measurements. Adjust here if the narration is re-recorded.
 */
exports.sceneStarts = [0, 6.9, 16.5, 24.6, 33.4, 44.5];
exports.expectedNarrationDuration = 59.89875;
/** Get the currently narrated panel, clamped to the six available panels. */
function panelForTime(time) {
    if (!Number.isFinite(time) || time <= 0)
        return 0;
    for (let i = exports.sceneStarts.length - 1; i >= 0; i--) {
        if (time >= exports.sceneStarts[i])
            return i;
    }
    return 0;
}
function panelStart(index) {
    return exports.sceneStarts[Math.max(0, Math.min(exports.sceneStarts.length - 1, Math.trunc(index) || 0))];
}

};
require('./main');
})();