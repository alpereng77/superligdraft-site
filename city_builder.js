/**
 * CityBuilder - Profesyonel İzometrik Futbol Kulübü Şehir Simülasyonu
 * Gerçekçi diorama zemin, asfalt ve taş yol döşeme sistemi, futbol çimi dokuları,
 * dinamik gölgeler, peyzaj ve akıcı kontroller
 */

(function () {
    'use strict';

    // ============================================================
    // 1. YAPILANDIRMA & SABİTLER
    // ============================================================
    const TILE_W = 80;
    const TILE_H = 40;
    const GRID_COLS = 26;
    const GRID_ROWS = 26;

    const BUILDING_DEFS = {
        stadium:    { gridW: 3, gridH: 3, purchaseCost: 0,     isStarter: true,  spriteScale: 0.92, bottomPad: 0.910, name: "Efsane Stadyumu" },
        training:   { gridW: 3, gridH: 3, purchaseCost: 18000, isStarter: false, spriteScale: 0.92, bottomPad: 0.880, name: "Antrenman Kompleksi" },
        academy:    { gridW: 2, gridH: 2, purchaseCost: 25000, isStarter: false, spriteScale: 0.85, bottomPad: 0.930, name: "Gençlik Futbol Akademisi" },
        medical:    { gridW: 2, gridH: 2, purchaseCost: 12000, isStarter: false, spriteScale: 0.85, bottomPad: 0.930, name: "Sağlık & Fizyoterapi" },
        track:      { gridW: 2, gridH: 2, purchaseCost: 9000,  isStarter: false, spriteScale: 0.85, bottomPad: 0.920, name: "Olimpik Sprint & Koşu Pisti" },
        pool:       { gridW: 2, gridH: 2, purchaseCost: 12000, isStarter: false, spriteScale: 0.85, bottomPad: 0.920, name: "Hidroterapi & Yüzme Havuzu" },
        clubhq:     { gridW: 2, gridH: 2, purchaseCost: 7500,  isStarter: false, spriteScale: 0.85, bottomPad: 0.930, name: "Kulüp Genel Merkezi" },
        hotel:      { gridW: 2, gridH: 2, purchaseCost: 14000, isStarter: false, spriteScale: 0.85, bottomPad: 0.920, name: "Sporcu Oteli & Kamp Tesisi" },
        scout:      { gridW: 2, gridH: 2, purchaseCost: 20000, isStarter: false, spriteScale: 0.85, bottomPad: 0.920, name: "Scout & Yetenek Laboratuvarı" },
        media:      { gridW: 2, gridH: 2, purchaseCost: 16000, isStarter: false, spriteScale: 0.85, bottomPad: 0.920, name: "Medya & TV Yayın Kulesi" },
        museum:     { gridW: 2, gridH: 2, purchaseCost: 25000, isStarter: false, spriteScale: 0.85, bottomPad: 0.920, name: "Kulüp Müzesi & Kupa Sarayı" },
        restaurant: { gridW: 2, gridH: 2, purchaseCost: 10000, isStarter: false, spriteScale: 0.85, bottomPad: 0.920, name: "Taraftar Meydanı & Sports Bistro" },
        fanshop:    { gridW: 2, gridH: 2, purchaseCost: 3500,  isStarter: false, spriteScale: 0.85, bottomPad: 0.940, name: "Kulüp Mağazası (Store)" },
        statue:     { gridW: 1, gridH: 1, purchaseCost: 5000,  isStarter: false, spriteScale: 0.85, bottomPad: 0.940, name: "Altın Efsane Heykeli" },
        fountain:   { gridW: 1, gridH: 1, purchaseCost: 4000,  isStarter: false, spriteScale: 0.85, bottomPad: 0.940, name: "Zafer & Şampiyonluk Çeşmesi" }
    };

    const ROAD_TYPES = {
        asphalt: { name: "Asfalt Bulvar", cost: 150, color: '#334155', curbColor: '#94a3b8', stripeColor: '#fbbf24' },
        paved:   { name: "Taş Kaldırım",  cost: 75,  color: '#e2e8f0', curbColor: '#cbd5e1', stripeColor: '#94a3b8' }
    };

    const LAND_PARCELS = [
        { id: 0, name: "Ana Kulüp Kampüsü",      cost: 0,      col: 2,  row: 2,  w: 14, h: 14, free: true },
        { id: 1, name: "Doğu Genişleme Sahası",  cost: 25000,  col: 16, row: 2,  w: 8,  h: 14 },
        { id: 2, name: "Güney Akademi Alanı",    cost: 50000,  col: 2,  row: 16, w: 14, h: 8  },
        { id: 3, name: "Premium Tesis Kompleksi", cost: 120000, col: 16, row: 16, w: 8,  h: 8  }
    ];

    // Renk Paleti - Doğal Futbol Çimi & Modern Tycoon Diorama
    const THEME = {
        grassLight:     '#7ca836',
        grassDark:      '#719b2e',
        grassAccent:    '#689028',
        grassMowed1:    '#7ea336',
        grassMowed2:    '#75992f',

        // 3D Toprak / Uçurum Derinliği
        cliffGrass:     '#4e7a22',
        cliffTopSoil:   '#5d4037',
        cliffDarkSoil:  '#3e2723',
        cliffRock:      '#271a16',
        cliffStone:     '#4e342e',

        // Grid & Seçim
        gridLine:       'rgba(255, 255, 255, 0.12)',
        gridLineDark:   'rgba(0, 0, 0, 0.05)',
        lockedGround:   '#cfd8dc',
        lockedEdge:     '#b0bec5',
        unownedLand:    'rgba(251, 191, 36, 0.08)',
        unownedBorder:  '#f59e0b',
        validPlacement: 'rgba(34, 197, 94, 0.55)',
        invalidPlacement:'rgba(239, 68, 68, 0.55)',
        selectionPulse: '#38bdf8'
    };

    // İlk kurulumdaki estetik ve ferah yerleşim
    const DEFAULT_PLACEMENTS = {
        stadium:  { col: 3, row: 3, rotation: 0 },
        clubhq:   { col: 8, row: 3, rotation: 0 },
        fanshop:  { col: 8, row: 6, rotation: 0 },
        medical:  { col: 3, row: 7, rotation: 0 },
        academy:  { col: 3, row: 12, rotation: 0 },
        training: { col: 7, row: 12, rotation: 0 }
    };

    // ============================================================
    // 2. MOTOR DURUMU (STATE)
    // ============================================================
    let canvas = null;
    let ctx = null;
    let canvasW = 0;
    let canvasH = 0;
    let camera = { x: 0, y: 0, zoom: 0.85 };
    let targetCamera = { x: 0, y: 0, zoom: 0.85 };
    
    let mode = 'select'; // 'select' | 'place' | 'move' | 'land' | 'road'
    let currentRoadType = 'asphalt'; // 'asphalt' | 'paved' | 'eraser'
    let isPaintingRoad = false;
    let lastPaintedTile = { col: -1, row: -1 };

    let ghost = null;
    let movingBuildingId = null;
    let selectedBuildingId = null;
    let hoveredGrid = { col: -1, row: -1 };
    
    let grid = [];       // [row][col] -> buildingId or null
    let imageCache = {};
    let needsRender = true;
    let animFrameId = null;
    let initialized = false;
    let decorations = [];

    // Etkileşim
    let pointerDown = false;
    let pointerStartX = 0, pointerStartY = 0;
    let pointerLastX = 0, pointerLastY = 0;
    let pointerMoved = false;
    let cameraStartX = 0, cameraStartY = 0;
    let pulseAngle = 0;

    // ============================================================
    // 3. İZOMETRİK KOORDİNAT DÖNÜŞÜMLERİ
    // ============================================================
    function gridToWorld(col, row) {
        return {
            x: (col - row) * (TILE_W / 2),
            y: (col + row) * (TILE_H / 2)
        };
    }

    function worldToScreen(wx, wy) {
        return {
            x: (wx + camera.x) * camera.zoom + canvasW / 2,
            y: (wy + camera.y) * camera.zoom + canvasH / 2
        };
    }

    function screenToWorld(sx, sy) {
        return {
            x: (sx - canvasW / 2) / camera.zoom - camera.x,
            y: (sy - canvasH / 2) / camera.zoom - camera.y
        };
    }

    function worldToGrid(wx, wy) {
        const col = (wx / (TILE_W / 2) + wy / (TILE_H / 2)) / 2;
        const row = (wy / (TILE_H / 2) - wx / (TILE_W / 2)) / 2;
        return { col: Math.floor(col), row: Math.floor(row) };
    }

    function gridToScreen(col, row) {
        const w = gridToWorld(col, row);
        return worldToScreen(w.x, w.y);
    }

    function screenToGrid(sx, sy) {
        const w = screenToWorld(sx, sy);
        return worldToGrid(w.x, w.y);
    }

    // ============================================================
    // 4. GRİD VE ALAN YÖNETİMİ
    // ============================================================
    function initGrid() {
        grid = [];
        for (let r = 0; r < GRID_ROWS; r++) {
            grid[r] = [];
            for (let c = 0; c < GRID_COLS; c++) {
                grid[r][c] = null;
            }
        }
    }

    function isLandOwnedAt(col, row) {
        if (col < 0 || row < 0 || col >= GRID_COLS || row >= GRID_ROWS) return false;
        const ownedLands = getCityData().lands || [0];
        for (const lid of ownedLands) {
            const p = LAND_PARCELS.find(lp => lp.id === lid);
            if (p && col >= p.col && col < p.col + p.w && row >= p.row && row < p.row + p.h) {
                return true;
            }
        }
        return false;
    }

    function getFootprint(type, col, row, rotation) {
        const def = BUILDING_DEFS[type];
        if (!def) return { cells: [], gw: 1, gh: 1 };
        const gw = (rotation % 2 === 0) ? def.gridW : def.gridH;
        const gh = (rotation % 2 === 0) ? def.gridH : def.gridW;
        const cells = [];
        for (let dr = 0; dr < gh; dr++) {
            for (let dc = 0; dc < gw; dc++) {
                cells.push({ col: col + dc, row: row + dr });
            }
        }
        return { cells, gw, gh };
    }

    function canPlace(type, col, row, rotation, excludeId) {
        const { cells } = getFootprint(type, col, row, rotation);
        if (cells.length === 0) return false;
        for (const c of cells) {
            // 1. Sadece satın alınmış arazide olmalı
            if (!isLandOwnedAt(c.col, c.row)) return false;
            if (c.row < 0 || c.row >= GRID_ROWS || c.col < 0 || c.col >= GRID_COLS) return false;

            // 2. Başka bir bina ile çakışamaz!
            const occupant = grid[c.row] ? grid[c.row][c.col] : null;
            if (occupant && occupant !== excludeId) return false;

            // 3. Yol üzerine bina inşa edilemez veya taşınamaz!
            if (getRoadAt(c.col, c.row)) return false;
        }
        return true;
    }

    function cleanConflictingRoads() {
        const cityData = getCityData();
        if (!cityData.roads || !cityData.placedBuildings) return;

        const occupiedCells = new Set();
        cityData.placedBuildings.forEach(b => {
            const { cells } = getFootprint(b.type, b.x, b.y, b.rotation);
            cells.forEach(c => occupiedCells.add(`${c.col},${c.row}`));
        });

        const initialLen = cityData.roads.length;
        cityData.roads = cityData.roads.filter(r => !occupiedCells.has(`${r.col},${r.row}`));
        if (cityData.roads.length !== initialLen) {
            saveCityState();
        }
    }

    function placeOnGrid(id, type, col, row, rotation) {
        const { cells } = getFootprint(type, col, row, rotation);
        cells.forEach(c => {
            if (c.row >= 0 && c.row < GRID_ROWS && c.col >= 0 && c.col < GRID_COLS) {
                if (!grid[c.row]) grid[c.row] = [];
                grid[c.row][c.col] = id;
            }
        });
    }

    function removeFromGrid(id) {
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                if (grid[r] && grid[r][c] === id) grid[r][c] = null;
            }
        }
    }

    function rebuildGrid() {
        initGrid();
        cleanConflictingRoads();
        const buildings = getCityData().placedBuildings || [];
        buildings.forEach(b => {
            placeOnGrid(b.id, b.type, b.x, b.y, b.rotation);
        });
        generateDecorations();
    }

    // ============================================================
    // 5. YOL YÖNETİMİ & DÖŞEME SİSTEMİ (ROAD ENGINE)
    // ============================================================
    function getRoadAt(col, row) {
        const roads = getCityData().roads || [];
        return roads.find(r => r.col === col && r.row === row) || null;
    }

    function applyRoadAt(col, row) {
        if (!isLandOwnedAt(col, row)) return;
        
        // Bina olan yere yol yapılamaz
        if (grid[row] && grid[row][col]) {
            if (typeof showTycoonToast === 'function') {
                showTycoonToast('Bina üzerine yol döşenmez!', 'info');
            }
            return;
        }

        const cityData = getCityData();
        if (!cityData.roads) cityData.roads = [];

        const existingIndex = cityData.roads.findIndex(r => r.col === col && r.row === row);

        if (currentRoadType === 'eraser') {
            if (existingIndex !== -1) {
                cityData.roads.splice(existingIndex, 1);
                saveCityState();
                requestRender();
            }
            return;
        }

        const cfg = ROAD_TYPES[currentRoadType];
        if (!cfg) return;

        // Zaten aynı tip yol varsa geç
        if (existingIndex !== -1 && cityData.roads[existingIndex].type === currentRoadType) {
            return;
        }

        // Bütçe kontrolü (sadece yeni yerleştirmelerde)
        if (existingIndex === -1 && tycoonState.money < cfg.cost) {
            if (typeof showTycoonToast === 'function') {
                showTycoonToast(`Yol için ${formatCurrency(cfg.cost)} gerekiyor!`, 'error');
            }
            return;
        }

        if (existingIndex === -1 && cfg.cost > 0) {
            tycoonState.money -= cfg.cost;
        }

        if (existingIndex !== -1) {
            cityData.roads[existingIndex].type = currentRoadType;
        } else {
            cityData.roads.push({ col, row, type: currentRoadType });
        }

        // Ağaç varsa kaldır
        decorations = decorations.filter(d => !(d.col === col && d.row === row));

        saveCityState();
        requestRender();
        if (typeof updateTycoonHUD === 'function') updateTycoonHUD();
    }

    function setRoadType(type) {
        currentRoadType = type;
        const ids = ['btn-road-asphalt', 'btn-road-paved', 'btn-road-eraser'];
        ids.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.remove('active');
        });
        const activeBtn = document.getElementById(`btn-road-${type}`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    function toggleRoadBar() {
        if (mode === 'road') {
            cancelAction();
        } else {
            mode = 'road';
            ghost = null;
            deselectBuilding();
            hideBuildPanel();
            hideLandPanel();
            hideBuildingPopup();
            
            const bar = document.getElementById('city-road-bar');
            if (bar) bar.classList.remove('hidden');
            
            updateToolbar();
            requestRender();
            if (typeof showTycoonToast === 'function') {
                showTycoonToast('🛣️ Yol Döşeme Modu: Haritada tıklayarak veya sürükleyerek yol çizin.', 'info');
            }
        }
    }

    // ============================================================
    // 6. GÖRSEL ÖN YÜKLEME & PEYZAJ
    // ============================================================
    function preloadImages() {
        getImage('icon-assets/ground.png');
        getImage('icon-assets/tree-oak.png');
        getImage('icon-assets/tree-pine.png');
        getImage('icon-assets/car-fan-vintage.png');
        getImage('icon-assets/car-fan-vintage-rear.png');
        getImage('icon-assets/car-fan-bus.png');
        getImage('icon-assets/car-fan-bus-rear.png');
        for (const type in TYCOON_CONFIG.buildings) {
            const cfg = TYCOON_CONFIG.buildings[type];
            if (cfg && cfg.images) {
                cfg.images.forEach(path => {
                    if (path && path.trim() !== '') {
                        getImage(path);
                    }
                });
            }
        }
    }

    function getImage(path) {
        if (!path || path.trim() === '') return null;
        if (imageCache[path]) return imageCache[path];

        const img = new Image();
        img.onload = () => {
            imageCache[path] = img;
            needsRender = true;
        };
        img.onerror = () => {
            console.warn("Bina görseli yüklenemedi:", path);
        };
        img.src = path;
        imageCache[path] = img;
        return img;
    }

    function getBuildingImage(type, level) {
        const cfg = TYCOON_CONFIG.buildings[type];
        if (!cfg || !cfg.images) return null;
        const path = cfg.images[level] || cfg.images[1] || cfg.images[2] || cfg.images[3];
        if (!path) return null;
        return getImage(path);
    }

    function generateDecorations() {
        decorations = [];
        const roads = getCityData().roads || [];

        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                if (!isLandOwnedAt(c, r)) continue;
                if (grid[r] && grid[r][c]) continue; // Bina üstüne konmaz
                if (roads.some(road => road.col === c && road.row === r)) continue; // Yol üstüne konmaz

                const seed = (c * 7919 + r * 104729) % 100;
                
                if (seed < 8) {
                    decorations.push({ col: c, row: r, type: 'tree_pine', variant: seed % 2 });
                } else if (seed >= 8 && seed < 14) {
                    decorations.push({ col: c, row: r, type: 'tree_oak', variant: seed % 2 });
                } else if (seed >= 14 && seed < 17) {
                    decorations.push({ col: c, row: r, type: 'lamp' });
                } else if (seed >= 17 && seed < 20) {
                    decorations.push({ col: c, row: r, type: 'flowers', variant: seed % 3 });
                }
            }
        }
    }

    // ============================================================
    // 7. GELİŞMİŞ İZOMETRİK ÇİZİM MOTORU (CANVAS ENGINE)
    // ============================================================
    function drawFrame() {
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, canvasW, canvasH);

        // 1. Atmosferik Gökyüzü / Gazete Kağıdı Arka Planı
        const bgGrad = ctx.createRadialGradient(
            canvasW * 0.5, canvasH * 0.4, 40,
            canvasW * 0.5, canvasH * 0.5, Math.max(canvasW, canvasH) * 0.8
        );
        bgGrad.addColorStop(0, '#fdfbf7');
        bgGrad.addColorStop(0.5, '#f5efe6');
        bgGrad.addColorStop(1, '#eae0d0');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvasW, canvasH);

        pulseAngle += 0.04;

        // 2. 3D Ada Alt Uçurum / Toprak Derinliği
        drawIsland3DDepth();

        // 3. Zemin Izgarası & Çim Dokusu
        drawTerrainTiles();

        // 4. Yollar ve Taş Kaldırımlar
        drawRoads();

        // 5. Bina Gölgeleri
        drawBuildingPlazas();

        // 6. Satın Alınabilir Arazi İşaretçileri
        drawLandExpansionMarkers();

        // 7. Peyzaj (Ağaçlar, Lambalar, Çiçekler) + Binalar (Z-Index Sıralı)
        drawObjectsSorted();

        // 8. Hayalet Bina (Placement Modu)
        drawGhostBuilding();

        // 9. Yol Hover Göstergesi
        drawRoadHoverPreview();

        // 10. Seçili Bina Vurgusu & Taktik Çemberi
        drawActiveSelection();

        ctx.restore();
    }

    function drawTileDiamond(col, row, fillColor, strokeColor, lineWidth = 0.5) {
        const top = gridToScreen(col, row);
        const tw = TILE_W * camera.zoom;
        const th = TILE_H * camera.zoom;

        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(top.x + tw / 2, top.y + th / 2);
        ctx.lineTo(top.x, top.y + th);
        ctx.lineTo(top.x - tw / 2, top.y + th / 2);
        ctx.closePath();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
    }

    // 3D Toprak/Uçurum Katmanı (Kesintisiz Dış Sınır Diorama Efekti)
    function drawIsland3DDepth() {
        const cliffHeight = 22 * camera.zoom;
        const s = camera.zoom;

        for (let r = GRID_ROWS - 1; r >= 0; r--) {
            for (let c = GRID_COLS - 1; c >= 0; c--) {
                if (!isLandOwnedAt(c, r)) continue;
                
                const hasSouthNeighbor = isLandOwnedAt(c, r + 1);
                const hasEastNeighbor = isLandOwnedAt(c + 1, r);

                const top = gridToScreen(c, r);
                const tw = TILE_W * s;
                const th = TILE_H * s;

                const bottomX = top.x;
                const bottomY = top.y + th;
                const rightX = top.x + tw / 2;
                const rightY = top.y + th / 2;
                const leftX = top.x - tw / 2;
                const leftY = top.y + th / 2;

                // 1. Doğu / Sağ-Alt Uçurum Duvarı (Dış Kenar)
                if (!hasEastNeighbor) {
                    ctx.save();
                    const grad = ctx.createLinearGradient(rightX, rightY, rightX, rightY + cliffHeight);
                    grad.addColorStop(0, THEME.cliffDarkSoil);
                    grad.addColorStop(0.4, THEME.cliffRock);
                    grad.addColorStop(1, '#1b120f');
                    ctx.fillStyle = grad;

                    ctx.beginPath();
                    ctx.moveTo(top.x, top.y + th / 2);
                    ctx.lineTo(rightX, rightY);
                    ctx.lineTo(rightX, rightY + cliffHeight);
                    ctx.lineTo(bottomX, bottomY + cliffHeight);
                    ctx.lineTo(bottomX, bottomY);
                    ctx.closePath();
                    ctx.fill();

                    // Taş tabakası çizgisi
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                    ctx.lineWidth = 1 * s;
                    ctx.beginPath();
                    ctx.moveTo(rightX, rightY + cliffHeight * 0.45);
                    ctx.lineTo(bottomX, bottomY + cliffHeight * 0.45);
                    ctx.stroke();
                    ctx.restore();
                }

                // 2. Güney / Sol-Alt Uçurum Duvarı (Dış Kenar)
                if (!hasSouthNeighbor) {
                    ctx.save();
                    const grad = ctx.createLinearGradient(leftX, leftY, leftX, leftY + cliffHeight);
                    grad.addColorStop(0, THEME.cliffTopSoil);
                    grad.addColorStop(0.4, THEME.cliffDarkSoil);
                    grad.addColorStop(1, THEME.cliffRock);
                    ctx.fillStyle = grad;

                    ctx.beginPath();
                    ctx.moveTo(leftX, leftY);
                    ctx.lineTo(bottomX, bottomY);
                    ctx.lineTo(bottomX, bottomY + cliffHeight);
                    ctx.lineTo(leftX, leftY + cliffHeight);
                    ctx.closePath();
                    ctx.fill();

                    // Üst çim sarkıntısı
                    ctx.strokeStyle = THEME.cliffGrass;
                    ctx.lineWidth = 2 * s;
                    ctx.beginPath();
                    ctx.moveTo(leftX, leftY);
                    ctx.lineTo(bottomX, bottomY);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    // Zemin Karoları (Kesintisiz Genişleyen 3D Diorama Çimi)
    function drawTerrainTiles() {
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const owned = isLandOwnedAt(c, r);
                const unownedParcel = getUnownedParcelAt(c, r);

                if (owned) {
                    const stripe = Math.floor((c + r) / 2) % 2 === 0;
                    const grassCol = stripe ? THEME.grassLight : THEME.grassDark;
                    drawTileDiamond(c, r, grassCol, THEME.gridLine, 0.4);
                } else if (unownedParcel) {
                    drawTileDiamond(c, r, THEME.unownedLand, THEME.unownedBorder, 0.6);
                }
            }
        }
    }

    // Yollar ve Taş Kaldırımlar Çizimi (Doğru İzometrik Eksen Hizalaması)
    function drawRoads() {
        const roads = getCityData().roads || [];

        roads.forEach(road => {
            if (!isLandOwnedAt(road.col, road.row)) return;

            const cfg = ROAD_TYPES[road.type] || ROAD_TYPES.asphalt;
            const top = gridToScreen(road.col, road.row);
            const tw = TILE_W * camera.zoom;
            const th = TILE_H * camera.zoom;
            const cx = top.x;
            const cy = top.y + th / 2;

            // 1. Yol Karosu Gövdesi
            drawTileDiamond(road.col, road.row, cfg.color, cfg.curbColor, 1.2 * camera.zoom);

            // 2. Yol Detayları (İzometrik Çapraz Şerit Çizgileri)
            if (road.type === 'asphalt') {
                const hasColMinus = getRoadAt(road.col - 1, road.row); // Sol-Üst (Col - 1)
                const hasColPlus  = getRoadAt(road.col + 1, road.row); // Sağ-Alt (Col + 1)
                const hasRowMinus = getRoadAt(road.col, road.row - 1); // Sağ-Üst (Row - 1)
                const hasRowPlus  = getRoadAt(road.col, road.row + 1); // Sol-Alt (Row + 1)

                const hasColAxis = hasColMinus || hasColPlus;
                const hasRowAxis = hasRowMinus || hasRowPlus;

                ctx.save();
                ctx.strokeStyle = cfg.stripeColor;
                ctx.lineWidth = 1.8 * camera.zoom;
                ctx.setLineDash([5 * camera.zoom, 4 * camera.zoom]);

                // Sütun Ekseni (Sol-Üstten Sağ-Alta doğru)
                if (hasColAxis || (!hasColAxis && !hasRowAxis)) {
                    ctx.beginPath();
                    ctx.moveTo(cx - tw / 4, cy - th / 4);
                    ctx.lineTo(cx + tw / 4, cy + th / 4);
                    ctx.stroke();
                }

                // Satır Ekseni (Sağ-Üstten Sol-Alta doğru)
                if (hasRowAxis) {
                    ctx.beginPath();
                    ctx.moveTo(cx + tw / 4, cy - th / 4);
                    ctx.lineTo(cx - tw / 4, cy + th / 4);
                    ctx.stroke();
                }

                ctx.restore();
            } else if (road.type === 'paved') {
                // Taş döşeme iç parke çizgileri
                ctx.save();
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
                ctx.lineWidth = 0.8 * camera.zoom;
                ctx.beginPath();
                ctx.moveTo(cx, cy - th / 4);
                ctx.lineTo(cx + tw / 4, cy);
                ctx.lineTo(cx, cy + th / 4);
                ctx.lineTo(cx - tw / 4, cy);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        });
    }

    // Yol Hover Önizleme Göstergesi
    function drawRoadHoverPreview() {
        if (mode !== 'road' || hoveredGrid.col < 0 || hoveredGrid.row < 0) return;
        if (!isLandOwnedAt(hoveredGrid.col, hoveredGrid.row)) return;

        const col = hoveredGrid.col;
        const row = hoveredGrid.row;
        const isBlocked = grid[row] && grid[row][col];

        if (currentRoadType === 'eraser') {
            drawTileDiamond(col, row, 'rgba(239, 68, 68, 0.45)', '#ef4444', 2);
        } else {
            const color = isBlocked ? THEME.invalidPlacement : 'rgba(251, 191, 36, 0.45)';
            const border = isBlocked ? '#ef4444' : '#fbbf24';
            drawTileDiamond(col, row, color, border, 2);
        }
    }

    function drawBuildingPlazas() {
        // Binaların yapay gölgeleri kaldırıldı
    }

    // Satın Alınabilir Genişleme Arazileri (Şık İpuçları)
    function drawLandExpansionMarkers() {
        const ownedLands = getCityData().lands || [0];

        LAND_PARCELS.forEach(p => {
            if (ownedLands.includes(p.id)) return;

            const topLeft = gridToScreen(p.col, p.row);
            const topRight = gridToScreen(p.col + p.w, p.row);
            const bottomRight = gridToScreen(p.col + p.w, p.row + p.h);
            const bottomLeft = gridToScreen(p.col, p.row + p.h);

            ctx.save();
            ctx.setLineDash([10 * camera.zoom, 6 * camera.zoom]);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.65 + Math.sin(pulseAngle * 1.5) * 0.3})`;
            ctx.lineWidth = 2.5 * camera.zoom;

            ctx.beginPath();
            ctx.moveTo(topLeft.x, topLeft.y);
            ctx.lineTo(topRight.x, topRight.y);
            ctx.lineTo(bottomRight.x, bottomRight.y);
            ctx.lineTo(bottomLeft.x, bottomLeft.y);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            const centerW = gridToWorld(p.col + p.w / 2, p.row + p.h / 2);
            const centerS = worldToScreen(centerW.x, centerW.y);

            const cardW = 140 * camera.zoom;
            const cardH = 46 * camera.zoom;
            const floatY = centerS.y + Math.sin(pulseAngle) * 4 * camera.zoom;

            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5 * camera.zoom;
            roundRect(ctx, centerS.x - cardW / 2, floatY - cardH / 2, cardW, cardH, 8 * camera.zoom);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.font = `bold ${10 * camera.zoom}px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`🗺️ ${p.name}`, centerS.x, floatY - 9 * camera.zoom);

            ctx.fillStyle = '#ffffff';
            ctx.font = `900 ${12 * camera.zoom}px Montserrat, sans-serif`;
            ctx.fillText(formatCurrency(p.cost), centerS.x, floatY + 9 * camera.zoom);
            ctx.restore();
        });
    }

    // ============================================================
    // 7.1. TARAFTAR ARAÇ & OTOBÜS TRAFİK SİMÜLASYONU
    // ============================================================
    let vehicles = [];

    function updateVehicles() {
        const cityData = getCityData();
        const roads = (cityData.roads || []).filter(r => r.type === 'asphalt');
        if (roads.length === 0) {
            vehicles = [];
            return;
        }

        // Sakin ve dengeli araç sayısı (Yol ağına göre maksimum 2-4 araç)
        const maxVehicles = Math.min(4, Math.max(1, Math.floor(roads.length / 8)));

        // Yeni araç doğur (spawn) - Seyrek ve tatlı bir trafik
        if (vehicles.length < maxVehicles && Math.random() < 0.02) {
            // Başka bir aracın olmadığı boş bir yol seç
            const emptyRoads = roads.filter(r => !vehicles.some(v => v.col === r.col && v.row === r.row));
            if (emptyRoads.length > 0) {
                const startRoad = emptyRoads[Math.floor(Math.random() * emptyRoads.length)];
                const neighbors = getAsphaltNeighbors(startRoad.col, startRoad.row, roads);
                if (neighbors.length > 0) {
                    const nextRoad = neighbors[Math.floor(Math.random() * neighbors.length)];
                    vehicles.push({
                        id: Math.random(),
                        type: Math.random() < 0.35 ? 'bus' : 'vintage',
                        col: startRoad.col,
                        row: startRoad.row,
                        prevCol: startRoad.col,
                        prevRow: startRoad.row,
                        targetCol: nextRoad.col,
                        targetRow: nextRoad.row,
                        progress: 0,
                        speed: 0.007 + Math.random() * 0.004
                    });
                }
            }
        }

        // Araçları asfalt yollar üzerinde ilerlet
        for (let i = vehicles.length - 1; i >= 0; i--) {
            const v = vehicles[i];
            
            // Eğer yol silindiyse aracı kaldır
            const onRoad = roads.some(r => r.col === v.targetCol && r.row === v.targetRow);
            if (!onRoad) {
                vehicles.splice(i, 1);
                continue;
            }

            v.progress += v.speed;

            if (v.progress >= 1.0) {
                v.prevCol = v.col;
                v.prevRow = v.row;
                v.col = v.targetCol;
                v.row = v.targetRow;
                v.progress = 0;

                const neighbors = getAsphaltNeighbors(v.col, v.row, roads);
                // Geri dönmek yerine düz/ileri yol tercihi yap
                const forwardNeighbors = neighbors.filter(n => !(n.col === v.prevCol && n.row === v.prevRow));
                
                if (forwardNeighbors.length === 0) {
                    // Yolun sonuna geldi: Haritadan/yoldan çıkar ve kaybolur (asla geriye U dönüşü yapmaz!)
                    vehicles.splice(i, 1);
                    continue;
                }

                const nextTarget = forwardNeighbors[Math.floor(Math.random() * forwardNeighbors.length)];
                v.targetCol = nextTarget.col;
                v.targetRow = nextTarget.row;
            }
        }
    }

    function getAsphaltNeighbors(col, row, roads) {
        const candidates = [
            { col: col + 1, row: row },
            { col: col - 1, row: row },
            { col: col, row: row + 1 },
            { col: col, row: row - 1 }
        ];
        return candidates.filter(c => roads.some(r => r.col === c.col && r.row === c.row));
    }

    function drawVehicle(v) {
        const curCol = v.col + (v.targetCol - v.col) * v.progress;
        const curRow = v.row + (v.targetRow - v.row) * v.progress;
        const centerW = gridToWorld(curCol + 0.5, curRow + 0.5);
        const centerS = worldToScreen(centerW.x, centerW.y);
        const s = camera.zoom;

        const dCol = v.targetCol - v.col;
        const dRow = v.targetRow - v.row;

        // 4 Yönlü Kusursuz İzometrik Açı Tespiti:
        // 1. dRow > 0 (Aşağı-Sola sürüş): Önü Güneybatıya bakan normal sprite (scale 1, 1)
        // 2. dCol > 0 (Aşağı-Sağa sürüş): Önü Güneydoğuya bakan yatay flip sprite (scale -1, 1)
        // 3. dRow < 0 (Yukarı-Sağa sürüş): Arkası görünen Kuzeydoğuya giden sprite (scale 1, 1)
        // 4. dCol < 0 (Yukarı-Sola sürüş): Arkası görünen Kuzeybatıya giden sprite (scale -1, 1)
        const isDrivingAway = (dRow < 0) || (dCol < 0);
        const isFlipped = (dCol > 0) || (dCol < 0);

        let imgPath = '';
        if (v.type === 'bus') {
            imgPath = isDrivingAway ? 'icon-assets/car-fan-bus-rear.png' : 'icon-assets/car-fan-bus.png';
        } else {
            imgPath = isDrivingAway ? 'icon-assets/car-fan-vintage-rear.png' : 'icon-assets/car-fan-vintage.png';
        }

        const img = getImage(imgPath);
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const baseSize = v.type === 'bus' ? 34 : 26;
        const drawW = baseSize * s;
        const drawH = drawW * (img.naturalHeight / img.naturalWidth);
        const bounce = Math.sin(Date.now() * 0.012 + v.id * 10) * 0.5 * s;

        ctx.save();
        // Tekerlekler doğrudan yolun yüzeyine (centerS.y) sıfır oturur
        ctx.translate(centerS.x, centerS.y - drawH * 0.22 + bounce);
        if (isFlipped) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
    }

    // Binalar, Peyzaj ve Araçların Z-Order'a Göre Kusursuz Çizimi
    function drawObjectsSorted() {
        const renderList = [];

        // 1. Binalar
        const buildings = getCityData().placedBuildings || [];
        buildings.forEach(b => {
            if (movingBuildingId === b.id) return;
            const def = BUILDING_DEFS[b.type] || { gridW: 2, gridH: 2 };
            const gw = (b.rotation % 2 === 0) ? def.gridW : def.gridH;
            const gh = (b.rotation % 2 === 0) ? def.gridH : def.gridW;
            const depth = (b.x + gw / 2) + (b.y + gh / 2);
            renderList.push({
                kind: 'building',
                depth: depth,
                data: b
            });
        });

        // 2. Peyzaj Nesneleri (Ağaçlar, Lambalar)
        decorations.forEach(d => {
            renderList.push({
                kind: 'decoration',
                depth: d.col + d.row + 0.5,
                data: d
            });
        });

        // 3. Yollarda Seyreden Taraftar Araçları & Minibüsleri
        vehicles.forEach(v => {
            const curCol = v.col + (v.targetCol - v.col) * v.progress;
            const curRow = v.row + (v.targetRow - v.row) * v.progress;
            renderList.push({
                kind: 'vehicle',
                depth: curCol + curRow + 0.5,
                data: v
            });
        });

        renderList.sort((a, b) => a.depth - b.depth);

        renderList.forEach(item => {
            if (item.kind === 'building') {
                drawBuildingSprite(item.data.type, item.data.level, item.data.x, item.data.y, item.data.rotation, 1.0, item.data.id);
            } else if (item.kind === 'decoration') {
                drawDecoration(item.data);
            } else if (item.kind === 'vehicle') {
                drawVehicle(item.data);
            }
        });
    }

    // 3D Peyzaj Öğeleri
    function drawDecoration(d) {
        const pos = gridToScreen(d.col, d.row);
        const th = TILE_H * camera.zoom;
        const cx = pos.x;
        const cy = pos.y + th / 2;
        const s = camera.zoom;

        ctx.save();

        if (d.type === 'tree_oak') {
            const img = getImage('icon-assets/tree-oak.png');
            if (img && img.complete && img.naturalWidth > 0) {
                const drawW = TILE_W * s * 0.92;
                const drawH = drawW * (img.naturalHeight / img.naturalWidth);
                const drawX = cx - drawW / 2;
                const drawY = cy + 4 * s - drawH * 0.94;
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            } else {
                ctx.fillStyle = '#78350f';
                ctx.fillRect(cx - 2.5 * s, cy - 9 * s, 5 * s, 11 * s);

                ctx.fillStyle = '#15803d';
                ctx.beginPath();
                ctx.arc(cx - 4 * s, cy - 18 * s, 8 * s, 0, Math.PI * 2);
                ctx.arc(cx + 4 * s, cy - 18 * s, 8 * s, 0, Math.PI * 2);
                ctx.arc(cx, cy - 23 * s, 9 * s, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (d.type === 'tree_pine') {
            const img = getImage('icon-assets/tree-pine.png');
            if (img && img.complete && img.naturalWidth > 0) {
                const drawW = TILE_W * s * 0.78;
                const drawH = drawW * (img.naturalHeight / img.naturalWidth);
                const drawX = cx - drawW / 2;
                const drawY = cy + 4 * s - drawH * 0.94;
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            } else {
                ctx.fillStyle = '#78350f';
                ctx.fillRect(cx - 2 * s, cy - 8 * s, 4 * s, 10 * s);

                const levels = [
                    { y: cy - 6 * s, w: 12 * s, h: 10 * s, col: '#166534' },
                    { y: cy - 14 * s, w: 10 * s, h: 9 * s, col: '#15803d' },
                    { y: cy - 21 * s, w: 7 * s, h: 8 * s, col: '#22c55e' }
                ];
                levels.forEach(lvl => {
                    ctx.fillStyle = lvl.col;
                    ctx.beginPath();
                    ctx.moveTo(cx, lvl.y - lvl.h);
                    ctx.lineTo(cx - lvl.w, lvl.y);
                    ctx.lineTo(cx + lvl.w, lvl.y);
                    ctx.closePath();
                    ctx.fill();
                });
            }
        } else if (d.type === 'lamp') {
            ctx.fillStyle = '#334155';
            ctx.fillRect(cx - 1.5 * s, cy - 18 * s, 3 * s, 20 * s);
            
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(cx, cy - 20 * s, 4 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(cx, cy, 14 * s, 7 * s, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
            ctx.fill();
        }

        ctx.restore();
    }

    // 3D Bina Model Çizimi ve Level Rozeti
    function drawBuildingSprite(type, level, col, row, rotation, alpha, buildingId) {
        const def = BUILDING_DEFS[type];
        if (!def) return;
        const gw = (rotation % 2 === 0) ? def.gridW : def.gridH;
        const gh = (rotation % 2 === 0) ? def.gridH : def.gridW;

        const img = getBuildingImage(type, level);

        const centerW = gridToWorld(col + gw / 2, row + gh / 2);
        const centerS = worldToScreen(centerW.x, centerW.y);
        const footprintW = (gw + gh) * TILE_W / 2 * camera.zoom;
        const bottomCornerY = centerS.y + (gw + gh) * (TILE_H / 4) * camera.zoom;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (img && img.complete && img.naturalWidth > 0) {
            const aspect = img.naturalHeight / img.naturalWidth;
            const drawW = footprintW * def.spriteScale;
            const drawH = drawW * aspect;
            const drawX = centerS.x - drawW / 2;
            const drawY = bottomCornerY - drawH * (def.bottomPad || 0.94);

            if (rotation % 2 !== 0) {
                ctx.translate(centerS.x, drawY + drawH / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            } else {
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            }
        } else {
            const tw = gw * TILE_W * camera.zoom * 0.4;
            const th2 = gh * TILE_H * camera.zoom * 1.1;
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(centerS.x - tw / 2, bottomCornerY - th2, tw, th2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(centerS.x - tw / 2, bottomCornerY - th2, tw, th2);
        }

        const cfg = TYCOON_CONFIG.buildings[type];
        const isMax = level >= (cfg?.maxLevel || 5);
        
        const badgeX = centerS.x;
        const badgeY = bottomCornerY + 6 * camera.zoom;
        const badgeW = (isMax ? 48 : 42) * camera.zoom;
        const badgeH = 18 * camera.zoom;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = isMax ? '#166534' : '#0f172a';
        ctx.strokeStyle = isMax ? '#4ade80' : '#fbbf24';
        ctx.lineWidth = 1.2 * camera.zoom;
        roundRect(ctx, badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6 * camera.zoom);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = isMax ? '#4ade80' : '#ffffff';
        ctx.font = `900 ${10 * camera.zoom}px Montserrat, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isMax ? '★ MAX' : `LV.${level}`, badgeX, badgeY);

        ctx.restore();
    }

    // Yerleştirme Hayaleti
    function drawGhostBuilding() {
        if (!ghost) return;

        const def = BUILDING_DEFS[ghost.type];
        if (!def) return;
        const gw = (ghost.rotation % 2 === 0) ? def.gridW : def.gridH;
        const gh = (ghost.rotation % 2 === 0) ? def.gridH : def.gridW;

        for (let dr = 0; dr < gh; dr++) {
            for (let dc = 0; dc < gw; dc++) {
                const c = ghost.col + dc;
                const r = ghost.row + dr;
                const fillCol = ghost.valid ? THEME.validPlacement : THEME.invalidPlacement;
                const strokeCol = ghost.valid ? '#22c55e' : '#ef4444';
                drawTileDiamond(c, r, fillCol, strokeCol, 1.8);
            }
        }

        const level = getPlacingBuildingLevel(ghost.type);
        drawBuildingSprite(ghost.type, level, ghost.col, ghost.row, ghost.rotation, 0.72);
    }

    // Seçili Bina Vurgusu
    function drawActiveSelection() {
        if (!selectedBuildingId || mode === 'move') return;
        const b = findBuildingById(selectedBuildingId);
        if (!b) return;

        const def = BUILDING_DEFS[b.type];
        if (!def) return;
        const gw = (b.rotation % 2 === 0) ? def.gridW : def.gridH;
        const gh = (b.rotation % 2 === 0) ? def.gridH : def.gridW;

        const haloAlpha = 0.4 + Math.sin(pulseAngle * 2) * 0.25;
        for (let dr = 0; dr < gh; dr++) {
            for (let dc = 0; dc < gw; dc++) {
                drawTileDiamond(b.x + dc, b.y + dr, `rgba(56, 189, 248, ${haloAlpha * 0.6})`, THEME.selectionPulse, 2);
            }
        }
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ============================================================
    // 8. RENDER DÖNGÜSÜ
    // ============================================================
    function renderLoop() {
        const lerpFactor = 0.15;
        if (Math.abs(camera.x - targetCamera.x) > 0.1 || Math.abs(camera.y - targetCamera.y) > 0.1 || Math.abs(camera.zoom - targetCamera.zoom) > 0.001) {
            camera.x += (targetCamera.x - camera.x) * lerpFactor;
            camera.y += (targetCamera.y - camera.y) * lerpFactor;
            camera.zoom += (targetCamera.zoom - camera.zoom) * lerpFactor;
            needsRender = true;
        }

        updateVehicles();
        if (vehicles.length > 0) {
            needsRender = true;
        }

        if (needsRender || pulseAngle !== 0) {
            drawFrame();
        }
        animFrameId = requestAnimationFrame(renderLoop);
    }

    function requestRender() {
        needsRender = true;
    }

    // ============================================================
    // 9. KULLANICI ETKİLEŞİMİ (MOUSE & TOUCH ENGINE)
    // ============================================================
    function getCanvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX || (e.touches && e.touches[0]?.clientX) || 0) - rect.left,
            y: (e.clientY || (e.touches && e.touches[0]?.clientY) || 0) - rect.top
        };
    }

    function onMouseDown(e) {
        if (e.button === 2) {
            e.preventDefault();
            cancelAction();
            return;
        }
        const pos = getCanvasPos(e);
        const gridPos = screenToGrid(pos.x, pos.y);

        pointerDown = true;
        pointerStartX = pos.x;
        pointerStartY = pos.y;
        pointerLastX = pos.x;
        pointerLastY = pos.y;
        pointerMoved = false;
        cameraStartX = targetCamera.x;
        cameraStartY = targetCamera.y;

        if (mode === 'road') {
            isPaintingRoad = true;
            lastPaintedTile = gridPos;
            applyRoadAt(gridPos.col, gridPos.row);
        }
    }

    function onMouseMove(e) {
        const pos = getCanvasPos(e);
        const gridPos = screenToGrid(pos.x, pos.y);
        hoveredGrid = gridPos;

        if (mode === 'road') {
            requestRender();
            if (isPaintingRoad) {
                if (lastPaintedTile.col !== gridPos.col || lastPaintedTile.row !== gridPos.row) {
                    lastPaintedTile = gridPos;
                    applyRoadAt(gridPos.col, gridPos.row);
                }
            }
            return;
        }

        if (mode === 'place' || mode === 'move') {
            updateGhostPosition(gridPos.col, gridPos.row);
        }

        if (pointerDown) {
            const dx = pos.x - pointerStartX;
            const dy = pos.y - pointerStartY;
            if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                pointerMoved = true;
            }

            if (pointerMoved && (mode === 'select' || mode === 'land')) {
                targetCamera.x = cameraStartX + dx / camera.zoom;
                targetCamera.y = cameraStartY + dy / camera.zoom;
                camera.x = targetCamera.x;
                camera.y = targetCamera.y;
                requestRender();
            }
        }
        pointerLastX = pos.x;
        pointerLastY = pos.y;
    }

    function onMouseUp(e) {
        const wasDrag = pointerMoved;
        pointerDown = false;
        pointerMoved = false;
        isPaintingRoad = false;
        if (wasDrag && mode !== 'road') return;

        const pos = getCanvasPos(e);
        const gridPos = screenToGrid(pos.x, pos.y);

        if (mode === 'place' || mode === 'move') {
            confirmPlacement();
        } else if (mode === 'land') {
            handleLandClick(gridPos.col, gridPos.row);
        } else if (mode === 'road') {
            // Road click already handled
        } else {
            handleSelectClick(gridPos.col, gridPos.row);
        }
    }

    function onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        targetCamera.zoom = Math.max(0.45, Math.min(1.8, targetCamera.zoom + delta));
        requestRender();
    }

    function onKeyDown(e) {
        if (e.key === 'r' || e.key === 'R') rotatePlacement();
        if (e.key === 'Escape') cancelAction();
    }

    // Dokunmatik
    let touchDist = 0;
    let touchZoomStart = 1;

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            const pos = getCanvasPos(e.touches[0]);
            const gridPos = screenToGrid(pos.x, pos.y);

            pointerDown = true;
            pointerStartX = pos.x;
            pointerStartY = pos.y;
            pointerLastX = pos.x;
            pointerLastY = pos.y;
            pointerMoved = false;
            cameraStartX = targetCamera.x;
            cameraStartY = targetCamera.y;

            if (mode === 'road') {
                isPaintingRoad = true;
                applyRoadAt(gridPos.col, gridPos.row);
            } else if (mode === 'place' || mode === 'move') {
                updateGhostPosition(gridPos.col, gridPos.row);
            }
        } else if (e.touches.length === 2) {
            pointerDown = false;
            isPaintingRoad = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchDist = Math.sqrt(dx * dx + dy * dy);
            touchZoomStart = targetCamera.zoom;
        }
        e.preventDefault();
    }

    function onTouchMove(e) {
        if (e.touches.length === 1 && pointerDown) {
            const pos = getCanvasPos(e.touches[0]);
            const gridPos = screenToGrid(pos.x, pos.y);
            const dx = pos.x - pointerStartX;
            const dy = pos.y - pointerStartY;
            if (Math.abs(dx) > 6 || Math.abs(dy) > 6) pointerMoved = true;

            if (mode === 'road' && isPaintingRoad) {
                applyRoadAt(gridPos.col, gridPos.row);
            } else if (mode === 'place' || mode === 'move') {
                updateGhostPosition(gridPos.col, gridPos.row);
            } else if (pointerMoved) {
                targetCamera.x = cameraStartX + dx / camera.zoom;
                targetCamera.y = cameraStartY + dy / camera.zoom;
                camera.x = targetCamera.x;
                camera.y = targetCamera.y;
                requestRender();
            }
            pointerLastX = pos.x;
            pointerLastY = pos.y;
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            targetCamera.zoom = Math.max(0.45, Math.min(1.8, touchZoomStart * (dist / touchDist)));
            requestRender();
        }
        e.preventDefault();
    }

    function onTouchEnd(e) {
        if (e.touches.length === 0) {
            const wasDrag = pointerMoved;
            pointerDown = false;
            pointerMoved = false;
            isPaintingRoad = false;
            if (!wasDrag && mode !== 'road') {
                const gridPos = screenToGrid(pointerLastX, pointerLastY);
                if (mode === 'place' || mode === 'move') confirmPlacement();
                else if (mode === 'land') handleLandClick(gridPos.col, gridPos.row);
                else handleSelectClick(gridPos.col, gridPos.row);
            }
        }
    }

    function setupInputHandlers() {
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('contextmenu', e => e.preventDefault());
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd);
        document.addEventListener('keydown', onKeyDown);
    }

    function removeInputHandlers() {
        if (!canvas) return;
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
        document.removeEventListener('keydown', onKeyDown);
    }

    // ============================================================
    // 10. OYUN İÇİ ETKİLEŞİM & BİNA AKSİYONLARI
    // ============================================================
    function handleSelectClick(col, row) {
        if (col >= 0 && row >= 0 && col < GRID_COLS && row < GRID_ROWS && grid[row] && grid[row][col]) {
            selectBuilding(grid[row][col]);
        } else {
            deselectBuilding();
        }
    }

    function handleLandClick(col, row) {
        const ownedLands = getCityData().lands || [0];
        for (const p of LAND_PARCELS) {
            if (ownedLands.includes(p.id)) continue;
            if (col >= p.col && col < p.col + p.w && row >= p.row && row < p.row + p.h) {
                showLandPurchaseConfirm(p);
                return;
            }
        }
    }

    function startPlacement(type) {
        const def = BUILDING_DEFS[type];
        if (!def) return;

        if (findBuildingByType(type)) {
            if (typeof showTycoonToast === 'function') {
                showTycoonToast(`${TYCOON_CONFIG.buildings[type]?.name || type} zaten kampüsünüzde inşa edildi!`, 'info');
            }
            return;
        }

        const cost = def.purchaseCost || 0;
        if (cost > 0 && tycoonState.money < cost) {
            if (typeof showTycoonToast === 'function') {
                showTycoonToast(`Bu tesis için ${formatCurrency(cost)} bütçe gerekiyor!`, 'error');
            }
            return;
        }

        mode = 'place';
        ghost = { type, col: 6, row: 5, rotation: 0, valid: false, isNew: true, cost };
        deselectBuilding();
        hideBuildPanel();
        hideRoadBar();
        updateToolbar();
        requestRender();
        if (typeof showTycoonToast === 'function') {
            showTycoonToast('🗺️ Tesisinizi yerleştirmek için haritada yeşil alana tıklayın. Döndürmek için [R] tuşuna basın.', 'info');
        }
    }

    function startMoveBuilding(buildingId) {
        const b = findBuildingById(buildingId);
        if (!b) return;

        mode = 'move';
        movingBuildingId = b.id;
        removeFromGrid(b.id);
        ghost = { type: b.type, col: b.x, row: b.y, rotation: b.rotation, valid: true, isNew: false };
        hideBuildingPopup();
        hideRoadBar();
        updateToolbar();
        requestRender();
        if (typeof showTycoonToast === 'function') {
            showTycoonToast('↔️ Binayı yeni konumuna taşıyın. [R] ile döndürün, tıkla onaylayın.', 'info');
        }
    }

    function updateGhostPosition(col, row) {
        if (!ghost) return;
        const def = BUILDING_DEFS[ghost.type];
        const gw = (ghost.rotation % 2 === 0) ? def.gridW : def.gridH;
        const gh = (ghost.rotation % 2 === 0) ? def.gridH : def.gridW;
        ghost.col = col - Math.floor(gw / 2);
        ghost.row = row - Math.floor(gh / 2);
        ghost.valid = canPlace(ghost.type, ghost.col, ghost.row, ghost.rotation, mode === 'move' ? movingBuildingId : null);
        requestRender();
    }

    function rotatePlacement() {
        if (!ghost) return;
        ghost.rotation = (ghost.rotation + 1) % 4;
        ghost.valid = canPlace(ghost.type, ghost.col, ghost.row, ghost.rotation, mode === 'move' ? movingBuildingId : null);
        requestRender();
    }

    function confirmPlacement() {
        if (!ghost || !ghost.valid) {
            if (ghost && !ghost.valid && typeof showTycoonToast === 'function') {
                showTycoonToast('❌ Bu alana yerleştirilemez! Lütfen boş yeşil bir arsa seçin.', 'error');
            }
            return;
        }

        const cityData = getCityData();

        if (mode === 'place') {
            if (ghost.cost > 0) tycoonState.money -= ghost.cost;
            const newBuilding = {
                id: 'b_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
                type: ghost.type,
                x: ghost.col,
                y: ghost.row,
                rotation: ghost.rotation,
                level: 1
            };
            cityData.placedBuildings.push(newBuilding);
            placeOnGrid(newBuilding.id, newBuilding.type, newBuilding.x, newBuilding.y, newBuilding.rotation);
            if (typeof showTycoonToast === 'function') {
                showTycoonToast(`🏗️ ${TYCOON_CONFIG.buildings[ghost.type]?.name || ghost.type} başarıyla inşa edildi!`, 'success');
            }
        } else if (mode === 'move') {
            const b = findBuildingById(movingBuildingId);
            if (b) {
                b.x = ghost.col;
                b.y = ghost.row;
                b.rotation = ghost.rotation;
                placeOnGrid(b.id, b.type, b.x, b.y, b.rotation);
            }
            movingBuildingId = null;
            if (typeof showTycoonToast === 'function') {
                showTycoonToast('✅ Tesis yeni konumuna başarıyla taşındı!', 'success');
            }
        }

        ghost = null;
        mode = 'select';
        syncBuildingLevels();
        saveCityState();
        generateDecorations();
        updateToolbar();
        requestRender();
    }

    function cancelAction() {
        if (mode === 'move' && movingBuildingId) {
            const b = findBuildingById(movingBuildingId);
            if (b) placeOnGrid(b.id, b.type, b.x, b.y, b.rotation);
            movingBuildingId = null;
        }
        ghost = null;
        mode = 'select';
        isPaintingRoad = false;
        hideBuildPanel();
        hideLandPanel();
        hideBuildingPopup();
        hideRoadBar();
        closeLandConfirm();
        updateToolbar();
        requestRender();
    }

    function selectBuilding(buildingId) {
        selectedBuildingId = buildingId;
        showBuildingPopup(buildingId);
        requestRender();
    }

    function deselectBuilding() {
        selectedBuildingId = null;
        hideBuildingPopup();
        requestRender();
    }

    function upgradeBuilding(buildingId) {
        const b = findBuildingById(buildingId);
        if (!b) return;
        const cfg = TYCOON_CONFIG.buildings[b.type];
        if (!cfg) return;

        if (b.level >= cfg.maxLevel) {
            if (typeof showTycoonToast === 'function') {
                showTycoonToast('Bu tesis maksimum seviyeye ulaştı!', 'info');
            }
            return;
        }

        if (typeof getBuildingUpgradeRequirement === 'function') {
            const req = getBuildingUpgradeRequirement(b.level + 1);
            if (!req.unlocked) {
                if (typeof showTycoonToast === 'function') {
                    showTycoonToast(`🔒 Bu tesisi ${b.level + 1}. Seviyeye yükseltmek için ${req.requiredTierName}'e yükselmeniz gerekmektedir!`, 'error');
                }
                return;
            }
        }

        const cost = cfg.costs[b.level];
        if (tycoonState.money < cost) {
            if (typeof showTycoonToast === 'function') {
                showTycoonToast(`Yükseltme için ${formatCurrency(cost)} gerekiyor!`, 'error');
            }
            return;
        }

        tycoonState.money -= cost;
        b.level += 1;
        syncBuildingLevels();
        saveCityState();
        requestRender();
        showBuildingPopup(buildingId);
        if (typeof showTycoonToast === 'function') {
            showTycoonToast(`🏗️ ${cfg.name} Seviye ${b.level}'e yükseltildi!`, 'success');
        }
        if (typeof updateTycoonHUD === 'function') updateTycoonHUD();
    }

    function sellBuilding(buildingId) {
        const b = findBuildingById(buildingId);
        if (!b) return;
        const cfg = TYCOON_CONFIG.buildings[b.type];
        const def = BUILDING_DEFS[b.type];

        let totalInvested = def.purchaseCost || 0;
        for (let i = 1; i < b.level; i++) totalInvested += (cfg.costs[i] || 0);
        const refund = Math.floor(totalInvested * 0.4);

        tycoonState.money += refund;
        removeFromGrid(b.id);
        getCityData().placedBuildings = getCityData().placedBuildings.filter(x => x.id !== b.id);

        deselectBuilding();
        syncBuildingLevels();
        saveCityState();
        generateDecorations();
        requestRender();
        if (typeof showTycoonToast === 'function') {
            showTycoonToast(`🗑️ ${cfg?.name || b.type} kaldırıldı. ${formatCurrency(refund)} iade edildi.`, 'info');
        }
        if (typeof updateTycoonHUD === 'function') updateTycoonHUD();
    }

    function purchaseLand(parcelId) {
        const parcel = LAND_PARCELS.find(p => p.id === parcelId);
        if (!parcel) return;
        const cityData = getCityData();
        if (cityData.lands.includes(parcelId)) return;

        if (tycoonState.money < parcel.cost) {
            if (typeof showTycoonToast === 'function') {
                showTycoonToast(`Bu arazi için ${formatCurrency(parcel.cost)} gerekiyor!`, 'error');
            }
            return;
        }

        tycoonState.money -= parcel.cost;
        cityData.lands.push(parcelId);
        saveCityState();
        generateDecorations();
        closeLandConfirm();
        hideLandPanel();
        mode = 'select';
        updateToolbar();
        requestRender();
        if (typeof showTycoonToast === 'function') {
            showTycoonToast(`🗺️ ${parcel.name} satın alındı! Kampüs genişletildi.`, 'success');
        }
        if (typeof updateTycoonHUD === 'function') updateTycoonHUD();
    }

    function getUnownedParcelAt(col, row) {
        const ownedLands = getCityData().lands || [0];
        for (const p of LAND_PARCELS) {
            if (ownedLands.includes(p.id)) continue;
            if (col >= p.col && col < p.col + p.w && row >= p.row && row < p.row + p.h) return p;
        }
        return null;
    }

    // ============================================================
    // 11. NOSTALJİK GAZETE TEMALI MODALLAR & ÇEKMECELER
    // ============================================================
    function attachDrawerScroll(gridId) {
        setTimeout(() => {
            const gridEl = document.getElementById(gridId);
            if (!gridEl) return;

            // Mouse tekerleğiyle yatay kaydırma
            gridEl.onwheel = function(e) {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    gridEl.scrollLeft += e.deltaY * 1.5;
                }
            };

            // Mouse ile tutup sürükleyerek kaydırma (Drag to scroll)
            let isDown = false;
            let startX, scrollLeft;

            gridEl.onmousedown = (e) => {
                isDown = true;
                gridEl.classList.add('dragging');
                startX = e.pageX - gridEl.offsetLeft;
                scrollLeft = gridEl.scrollLeft;
            };
            gridEl.onmouseleave = () => { isDown = false; gridEl.classList.remove('dragging'); };
            gridEl.onmouseup = () => { isDown = false; gridEl.classList.remove('dragging'); };
            gridEl.onmousemove = (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - gridEl.offsetLeft;
                const walk = (x - startX) * 1.8;
                gridEl.scrollLeft = scrollLeft - walk;
            };
        }, 30);
    }

    let currentBuildCategory = 'all';

    const BUILDING_CATEGORIES = {
        stadium:    'football',
        training:   'football',
        academy:    'football',
        medical:    'football',
        track:      'football',
        pool:       'football',
        clubhq:     'management',
        scout:      'management',
        hotel:      'management',
        fanshop:    'commerce',
        restaurant: 'commerce',
        museum:     'commerce',
        media:      'commerce',
        statue:     'decor',
        fountain:   'decor'
    };

    function filterBuildCategory(category) {
        currentBuildCategory = category || 'all';
        openBuildMenu(currentBuildCategory);
    }

    function scrollDrawer(direction) {
        const grid = document.querySelector('.build-panel-grid');
        if (!grid) return;
        const amount = direction === 'left' ? -220 : 220;
        grid.scrollBy({ left: amount, behavior: 'smooth' });
    }

    function showBuildPanel() {
        openBuildMenu('all');
    }

    function openBuildMenu(selectedCategory = currentBuildCategory) {
        const panel = document.getElementById('city-build-panel');
        if (!panel) return;

        mode = 'select';
        ghost = null;
        deselectBuilding();
        hideLandPanel();
        hideRoadBar();

        const activeCat = selectedCategory || currentBuildCategory || 'all';
        currentBuildCategory = activeCat;

        const placed = getCityData().placedBuildings || [];
        const allKeys = Object.keys(BUILDING_DEFS);
        const footballCount = allKeys.filter(k => BUILDING_CATEGORIES[k] === 'football').length;
        const managementCount = allKeys.filter(k => BUILDING_CATEGORIES[k] === 'management').length;
        const commerceCount = allKeys.filter(k => BUILDING_CATEGORIES[k] === 'commerce').length;
        const decorCount = allKeys.filter(k => BUILDING_CATEGORIES[k] === 'decor').length;

        let html = `
            <div class="build-drawer-backdrop" onclick="CityBuilder.cancelAction()"></div>
            <div class="build-drawer-card">
                <div class="build-panel-header">
                    <div class="build-title-block">
                        <img src="icon-assets/icon-city.png" alt="İnşaat" class="badge-3d-icon" style="width:28px;height:28px;max-width:28px;max-height:28px;object-fit:contain;vertical-align:middle;" />
                        <div>
                            <h3>KULÜP TESİSİ İNŞA ET</h3>
                            <span class="sub-text">Tesisleri kampüsünüze yerleştirerek gelir ve güç kazanın</span>
                        </div>
                    </div>
                    <div class="drawer-header-actions">
                        <button class="drawer-scroll-btn" onclick="CityBuilder.scrollDrawer('left')" title="Sola Kaydır"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="drawer-scroll-btn" onclick="CityBuilder.scrollDrawer('right')" title="Sağa Kaydır"><i class="fa-solid fa-chevron-right"></i></button>
                        <button class="build-panel-close" onclick="CityBuilder.cancelAction()" title="Kapat"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>

                <div class="build-category-tabs">
                    <button class="build-cat-tab ${activeCat === 'all' ? 'active' : ''}" onclick="CityBuilder.filterBuildCategory('all')">
                        <img src="icon-assets/icon-city.png" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;" /> Tümü (${allKeys.length})
                    </button>
                    <button class="build-cat-tab ${activeCat === 'football' ? 'active' : ''}" onclick="CityBuilder.filterBuildCategory('football')">
                        <img src="icon-assets/icon-tactics.png" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;" /> Futbol (${footballCount})
                    </button>
                    <button class="build-cat-tab ${activeCat === 'management' ? 'active' : ''}" onclick="CityBuilder.filterBuildCategory('management')">
                        <img src="icon-assets/icon-squad.png" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;" /> Yönetim (${managementCount})
                    </button>
                    <button class="build-cat-tab ${activeCat === 'commerce' ? 'active' : ''}" onclick="CityBuilder.filterBuildCategory('commerce')">
                        <img src="icon-assets/icon-sponsor.png" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;" /> Ticaret (${commerceCount})
                    </button>
                    <button class="build-cat-tab ${activeCat === 'decor' ? 'active' : ''}" onclick="CityBuilder.filterBuildCategory('decor')">
                        <img src="icon-assets/icon-trophy.png" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;" /> Heykel & Peyzaj (${decorCount})
                    </button>
                </div>

                <div class="build-panel-grid" id="city-build-grid">
        `;

        const filteredKeys = allKeys.filter(type => {
            if (activeCat === 'all') return true;
            return BUILDING_CATEGORIES[type] === activeCat;
        });

        filteredKeys.forEach(type => {
            const def = BUILDING_DEFS[type];
            const cfg = TYCOON_CONFIG.buildings[type];
            if (!cfg) return;

            const alreadyBuilt = placed.some(b => b.type === type);
            const cost = def.purchaseCost || 0;
            const canAfford = tycoonState.money >= cost;
            const img = cfg.images[1] || '';

            let perkPill = "";
            if (type === "stadium") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-ticket"></i> +1.5K € / maç</span>`;
            if (type === "fanshop") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-coins"></i> +10 € / sn</span>`;
            if (type === "clubhq") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-shield-halved"></i> +1 Takım OVR</span>`;
            if (type === "medical") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-heart-pulse"></i> +%5 Form</span>`;
            if (type === "academy") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-graduation-cap"></i> +%10 Scout</span>`;
            if (type === "training") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-dumbbell"></i> -%5 İndirim</span>`;
            if (type === "track") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-person-running"></i> +1 Hız & Pace</span>`;
            if (type === "pool") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-person-swimming"></i> +%10 İyileşme</span>`;
            if (type === "hotel") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-hotel"></i> +%5 Kondisyon</span>`;
            if (type === "scout") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-crosshairs"></i> +%8 Yetenek</span>`;
            if (type === "media") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-tower-broadcast"></i> +50 € / sn</span>`;
            if (type === "museum") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-trophy"></i> +75 € / sn</span>`;
            if (type === "restaurant") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-utensils"></i> +30 € / sn</span>`;
            if (type === "statue") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-crown"></i> +2 Moral & OVR</span>`;
            if (type === "fountain") perkPill = `<span class="build-perk-badge"><i class="fa-solid fa-water"></i> +20 € / sn</span>`;

            html += `
                <div class="build-shop-card ${alreadyBuilt ? 'built' : ''} ${!alreadyBuilt && !canAfford ? 'disabled' : ''}">
                    <div class="build-card-img-wrap">
                        <img src="${img}" alt="${cfg.name}" />
                        <span class="build-size-badge">${def.gridW}×${def.gridH} ALAN</span>
                    </div>
                    <div class="build-card-content">
                        <h4>${cfg.name}</h4>
                        <div class="build-perk-row">${perkPill}</div>
                        <p class="build-desc">${cfg.desc}</p>
                    </div>
                    <div class="build-card-footer">
                        ${alreadyBuilt
                            ? '<div class="btn-built-status"><i class="fa-solid fa-circle-check"></i> İnşa Edildi</div>'
                            : `<button class="btn-shop-build ${canAfford ? 'ready' : 'disabled'}" onclick="CityBuilder.startBuild('${type}')" ${!canAfford ? 'disabled' : ''}>
                                    <i class="fa-solid fa-hammer"></i> ${cost > 0 ? `Satın Al • ${formatCurrency(cost)}` : 'Ücretsiz Yerleştir'}
                               </button>`
                        }
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
        panel.innerHTML = html;
        panel.classList.remove('hidden');
        attachDrawerScroll('city-build-grid');
        updateToolbar();
    }

    function hideBuildPanel() {
        const panel = document.getElementById('city-build-panel');
        if (panel) panel.classList.add('hidden');
    }

    function hideRoadBar() {
        const bar = document.getElementById('city-road-bar');
        if (bar) bar.classList.add('hidden');
    }

    function showLandPanel() {
        mode = 'land';
        ghost = null;
        deselectBuilding();
        hideBuildPanel();
        hideBuildingPopup();
        hideRoadBar();
        updateToolbar();
        requestRender();

        const panel = document.getElementById('city-land-panel');
        if (!panel) return;

        const ownedLands = getCityData().lands || [0];
        let html = `
            <div class="build-drawer-backdrop" onclick="CityBuilder.cancelAction()"></div>
            <div class="build-drawer-card">
                <div class="build-panel-header">
                    <div class="build-title-block">
                        <i class="fa-solid fa-map text-gold"></i>
                        <div>
                            <h3>KAMPÜS ARAZİSİ GENİŞLET</h3>
                            <span class="sub-text">Haritada yanıp sönen parsellere tıklayarak veya listeden arazi satın alın</span>
                        </div>
                    </div>
                    <div class="drawer-header-actions">
                        <button class="drawer-scroll-btn" onclick="CityBuilder.scrollDrawer('left')" title="Sola Kaydır"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="drawer-scroll-btn" onclick="CityBuilder.scrollDrawer('right')" title="Sağa Kaydır"><i class="fa-solid fa-chevron-right"></i></button>
                        <button class="build-panel-close" onclick="CityBuilder.cancelAction()" title="Kapat"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
                <div class="build-panel-grid" id="city-land-grid">
        `;

        LAND_PARCELS.forEach(p => {
            if (p.free) return;
            const owned = ownedLands.includes(p.id);
            const canAfford = tycoonState.money >= p.cost;

            html += `
                <div class="build-shop-card land-card ${owned ? 'built' : ''} ${!owned && !canAfford ? 'disabled' : ''}">
                    <div class="build-card-img-wrap land-img-wrap">
                        <i class="fa-solid fa-map-location-dot land-huge-icon"></i>
                        <span class="build-size-badge">${p.w}×${p.h} ALAN</span>
                    </div>
                    <div class="build-card-content">
                        <h4>${p.name}</h4>
                        <p class="build-desc">Kulübünüze ${p.w * p.h} yeni inşaat hücresi kazandırır.</p>
                    </div>
                    <div class="build-card-footer">
                        ${owned
                            ? '<div class="btn-built-status"><i class="fa-solid fa-circle-check"></i> Sahipsiniz</div>'
                            : `<button class="btn-shop-build ${canAfford ? 'ready' : 'disabled'}" onclick="CityBuilder.buyLand(${p.id})" ${!canAfford ? 'disabled' : ''}>
                                    <i class="fa-solid fa-coins"></i> Satın Al • ${formatCurrency(p.cost)}
                               </button>`
                        }
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
        panel.innerHTML = html;
        panel.classList.remove('hidden');
        attachDrawerScroll('city-land-grid');
    }

    function hideLandPanel() {
        const panel = document.getElementById('city-land-panel');
        if (panel) panel.classList.add('hidden');
    }

    function showLandPurchaseConfirm(parcel) {
        const canAfford = tycoonState.money >= parcel.cost;
        let popup = document.getElementById('city-land-confirm');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'city-land-confirm';
            popup.className = 'city-land-confirm';
            document.getElementById('city-canvas-wrapper').appendChild(popup);
        }

        popup.innerHTML = `
            <div class="land-confirm-card">
                <div class="land-badge-icon"><i class="fa-solid fa-map-location-dot"></i></div>
                <h4>${parcel.name}</h4>
                <p>${parcel.w}×${parcel.h} hücrelik arazi alanı kampüsünüze dahil edilecek.</p>
                <div class="land-confirm-price">${formatCurrency(parcel.cost)}</div>
                <div class="land-confirm-actions">
                    <button class="btn-build-action ready ${!canAfford ? 'disabled' : ''}" onclick="CityBuilder.buyLand(${parcel.id})" ${!canAfford ? 'disabled' : ''}>
                        <i class="fa-solid fa-check"></i> Satın Al ve Genişlet
                    </button>
                    <button class="btn-build-action cancel" onclick="CityBuilder.closeLandConfirm()">
                        <i class="fa-solid fa-xmark"></i> Vazgeç
                    </button>
                </div>
            </div>
        `;
        popup.classList.remove('hidden');
    }

    function closeLandConfirm() {
        const popup = document.getElementById('city-land-confirm');
        if (popup) popup.classList.add('hidden');
    }

    function showBuildingPopup(buildingId) {
        const popup = document.getElementById('city-building-popup');
        if (!popup) return;
        const b = findBuildingById(buildingId);
        if (!b) { hideBuildingPopup(); return; }

        const cfg = TYCOON_CONFIG.buildings[b.type];
        if (!cfg) return;
        const def = BUILDING_DEFS[b.type];
        const isMax = b.level >= cfg.maxLevel;
        const nextCost = !isMax ? cfg.cost[b.level + 1] : 0;
        const req = (typeof getBuildingUpgradeRequirement === 'function') ? getBuildingUpgradeRequirement(b.level + 1) : { unlocked: true };
        const isLockedByTier = !isMax && !req.unlocked;
        const canAfford = !isMax && !isLockedByTier && tycoonState.money >= nextCost;

        let perkText = getPerkText(b.type, b.level);
        let nextPerkText = !isMax ? getPerkText(b.type, b.level + 1) : '';
        const imgSrc = cfg.images[b.level] || cfg.images[1] || '';

        popup.innerHTML = `
            <div class="bpopup-card-glass">
                <div class="bpopup-header">
                    <div class="bpopup-thumb-wrap">
                        <img src="${imgSrc}" class="bpopup-thumb" alt="${cfg.name}" />
                    </div>
                    <div class="bpopup-title">
                        <h4>${cfg.name}</h4>
                        <div class="bpopup-stars-row">
                            <span class="bpopup-level-badge ${isMax ? 'max' : ''}">
                                ${isMax ? '<i class="fa-solid fa-crown"></i> MAX SEVİYE' : `SEVİYE ${b.level} / ${cfg.maxLevel}`}
                            </span>
                            <span class="stars-gold">${'★'.repeat(b.level)}${'☆'.repeat(cfg.maxLevel - b.level)}</span>
                        </div>
                    </div>
                    <button class="bpopup-close" onclick="CityBuilder.deselect()"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="bpopup-perks">
                    <div class="bpopup-perk current">
                        <span class="perk-label"><i class="fa-solid fa-bolt text-green"></i> Mevcut Getiri:</span>
                        <span class="perk-value">${perkText}</span>
                    </div>
                    ${!isMax ? `
                        <div class="bpopup-perk next">
                            <span class="perk-label"><i class="fa-solid fa-arrow-trend-up text-gold"></i> Sonraki Seviye:</span>
                            <span class="perk-value">${nextPerkText}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="bpopup-actions">
                    ${isMax ? `
                        <div class="bpopup-btn maxed"><i class="fa-solid fa-crown"></i> Maksimum Seviyeye Ulaşıldı</div>
                    ` : isLockedByTier ? `
                        <button class="bpopup-btn upgrade locked disabled" style="background: #e2e8f0; color: #64748b; border: 2px dashed #94a3b8; cursor: not-allowed;" disabled title="${req.requiredTierName} gereklidir!">
                            <i class="fa-solid fa-lock"></i> Kilitli • ${req.requiredTierName}
                        </button>
                    ` : `
                        <button class="bpopup-btn upgrade ${!canAfford ? 'disabled' : ''}" onclick="CityBuilder.upgrade('${buildingId}')" ${!canAfford ? 'disabled' : ''}>
                            <i class="fa-solid fa-arrow-up"></i> Seviye Yükselt • ${formatCurrency(nextCost)}
                        </button>
                    `}
                    <div class="bpopup-secondary">
                        <button class="bpopup-btn secondary" onclick="CityBuilder.move('${buildingId}')" title="Binanın yerini değiştir">
                            <i class="fa-solid fa-arrows-up-down-left-right"></i> Taşı
                        </button>
                        <button class="bpopup-btn secondary" onclick="CityBuilder.rotatePlaced('${buildingId}')" title="90 Derece Döndür">
                            <i class="fa-solid fa-rotate"></i> Döndür
                        </button>
                        <button class="bpopup-btn secondary danger" onclick="CityBuilder.sell('${buildingId}')" title="Binayı kaldır ve bütçe iadesi al">
                            <i class="fa-solid fa-trash-can"></i> Kaldır
                        </button>
                    </div>
                </div>
            </div>
        `;

        const gw = (b.rotation % 2 === 0) ? def.gridW : def.gridH;
        const gh = (b.rotation % 2 === 0) ? def.gridH : def.gridW;
        const centerW = gridToWorld(b.x + gw / 2, b.y + gh / 2);
        const centerS = worldToScreen(centerW.x, centerW.y);

        popup.style.left = Math.min(canvasW - 290, Math.max(12, centerS.x - 140)) + 'px';
        popup.style.top = Math.max(14, centerS.y - 300) + 'px';
        popup.classList.remove('hidden');
    }

    function hideBuildingPopup() {
        const popup = document.getElementById('city-building-popup');
        if (popup) popup.classList.add('hidden');
    }

    function getPerkText(type, level) {
        const cfg = TYCOON_CONFIG.buildings[type];
        if (!cfg) return '';
        if (type === 'stadium') return `+${formatCurrency(cfg.income[level])} / maç`;
        if (type === 'fanshop') return `+${formatCurrency(cfg.passive[level])} / saniye`;
        if (type === 'clubhq') return `+${cfg.teamBoost[level]} Takım OVR`;
        if (type === 'medical') return `+%${cfg.recovery[level]} Form & Kondisyon`;
        if (type === 'academy') return `+%${cfg.scoutBonus[level]} Altyapı Keşfi`;
        if (type === 'training') return `-%${Math.round((cfg.discount[level] || 0) * 100)} Gelişim İndirimi`;
        if (type === 'hotel') return `+%${cfg.staminaBonus[level]} Enerji & Rejenerasyon`;
        if (type === 'scout') return `+%${cfg.scoutBonus[level]} Global Yetenek Keşfi`;
        if (type === 'media') return `+${formatCurrency(cfg.passive[level])} / saniye (TV Geliri)`;
        if (type === 'museum') return `+${formatCurrency(cfg.passive[level])} / saniye (Turizm)`;
        if (type === 'restaurant') return `+${formatCurrency(cfg.passive[level])} / saniye (Yeme-İçme)`;
        if (type === 'statue') return `+${cfg.moraleBonus[level]} Takım Morali & OVR`;
        if (type === 'pool') return `+%${cfg.recoveryBonus[level]} Sakatlık & Kondisyon İyileşmesi`;
        if (type === 'track') return `+${cfg.speedBonus[level]} Takım Hız & Sprint Bonusu`;
        if (type === 'fountain') return `+${formatCurrency(cfg.passive[level])} / saniye (Ziyaretçi Cirosu)`;
        return '';
    }

    function rotatePlacedBuilding(buildingId) {
        const b = findBuildingById(buildingId);
        if (!b) return;
        const newRotation = (b.rotation + 1) % 4;
        removeFromGrid(b.id);
        if (canPlace(b.type, b.x, b.y, newRotation, null)) {
            b.rotation = newRotation;
            placeOnGrid(b.id, b.type, b.x, b.y, b.rotation);
            saveCityState();
            requestRender();
            showBuildingPopup(buildingId);
        } else {
            placeOnGrid(b.id, b.type, b.x, b.y, b.rotation);
            if (typeof showTycoonToast === 'function') {
                showTycoonToast('Bu yönde döndürmek için yeterli boş alan yok!', 'error');
            }
        }
    }

    function updateToolbar() {
        const ids = ['btn-city-build', 'btn-city-land', 'btn-city-road', 'btn-city-cancel'];
        ids.forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('active'); });

        const cancelBtn = document.getElementById('btn-city-cancel');
        if (cancelBtn) {
            if (mode === 'place' || mode === 'move' || mode === 'land' || mode === 'road') {
                cancelBtn.classList.remove('hidden');
            } else {
                cancelBtn.classList.add('hidden');
            }
        }

        if (mode === 'land') {
            const l = document.getElementById('btn-city-land'); if (l) l.classList.add('active');
        }
        if (mode === 'road') {
            const ro = document.getElementById('btn-city-road'); if (ro) ro.classList.add('active');
        }
    }

    // ============================================================
    // 12. KALICILIK & MİGRASYON
    // ============================================================
    function getCityData() {
        if (!tycoonState.city) {
            tycoonState.city = { lands: [0], placedBuildings: [], roads: [] };
        }
        if (!tycoonState.city.roads) tycoonState.city.roads = [];
        return tycoonState.city;
    }

    function findBuildingById(id) {
        return (getCityData().placedBuildings || []).find(b => b.id === id);
    }

    function findBuildingByType(type) {
        return (getCityData().placedBuildings || []).find(b => b.type === type);
    }

    function getPlacingBuildingLevel(type) {
        const existing = findBuildingByType(type);
        return existing ? existing.level : 1;
    }

    function syncBuildingLevels() {
        tycoonState.buildings = {};
        (getCityData().placedBuildings || []).forEach(b => { tycoonState.buildings[b.type] = b.level; });
    }

    function saveCityState() {
        if (typeof saveTycoonData === 'function') saveTycoonData();
        if (typeof updateTycoonHUD === 'function') updateTycoonHUD();
    }

    function migrateOldState() {
        const cityData = getCityData();

        // Eski kenara yapışık veya taşan binaları güvenli orta alana çek
        if (cityData.placedBuildings && cityData.placedBuildings.length > 0) {
            let changed = false;
            cityData.placedBuildings.forEach(b => {
                if (b.type === 'stadium' && (b.x < 4 || b.y < 4)) {
                    b.x = 5;
                    b.y = 5;
                    changed = true;
                } else if (b.type === 'clubhq' && (b.x < 3 || b.y < 3)) {
                    b.x = 8;
                    b.y = 4;
                    changed = true;
                } else if (b.x < 3 || b.y < 3) {
                    b.x = Math.max(3, Math.min(8, b.x));
                    b.y = Math.max(3, Math.min(8, b.y));
                    changed = true;
                }
            });
            if (changed) {
                syncBuildingLevels();
                saveCityState();
            }
        }

        if (!cityData.initialized || !cityData.placedBuildings || cityData.placedBuildings.length === 0) {
            cityData.initialized = true;
            cityData.lands = [0];
            cityData.roads = [];

            // Yalnızca Ana Stadyum merkezde (5,5) kurulu başlar, diğer 5 tesis "İnşa Et" ile özgürce yerleştirilir
            const stadiumLevel = (tycoonState.buildings && tycoonState.buildings.stadium) || 1;
            cityData.placedBuildings = [
                {
                    id: 'b_stadium_' + Date.now().toString(36),
                    type: 'stadium',
                    x: 5,
                    y: 5,
                    rotation: 0,
                    level: stadiumLevel
                }
            ];

            syncBuildingLevels();
            saveCityState();
        }
    }

    function centerCameraOnCampus() {
        const parcel = LAND_PARCELS[0];
        const centerW = gridToWorld(parcel.col + parcel.w / 2, parcel.row + parcel.h / 2);
        targetCamera.x = -centerW.x;
        targetCamera.y = -centerW.y + 20;
        targetCamera.zoom = 0.70;
        camera.x = targetCamera.x;
        camera.y = targetCamera.y;
        camera.zoom = targetCamera.zoom;
        requestRender();
    }

    // ============================================================
    // 13. BAŞLATMA (LIFECYCLE)
    // ============================================================
    function init() {
        canvas = document.getElementById('city-iso-canvas');
        if (!canvas) { console.error('CityBuilder: Canvas not found'); return; }
        ctx = canvas.getContext('2d');

        migrateOldState();
        resize();
        rebuildGrid();
        centerCameraOnCampus();

        preloadImages();
        generateDecorations();
        setupInputHandlers();

        needsRender = true;
        renderLoop();
        initialized = true;
        updateToolbar();
    }

    function destroy() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animFrameId = null;
        removeInputHandlers();
        initialized = false;
    }

    function resize() {
        if (!canvas) return;
        const wrapper = canvas.parentElement;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        canvasW = rect.width;
        canvasH = rect.height;
        canvas.width = canvasW * dpr;
        canvas.height = canvasH * dpr;
        canvas.style.width = canvasW + 'px';
        canvas.style.height = canvasH + 'px';
        needsRender = true;
    }

    // ============================================================
    // 14. PUBLIC API
    // ============================================================
    window.CityBuilder = {
        init, destroy, resize,
        refresh: requestRender,
        isInitialized: function() { return initialized; },

        // Toolbar
        openBuildPanel: showBuildPanel,
        filterBuildCategory: filterBuildCategory,
        openLandPanel: showLandPanel,
        scrollDrawer: scrollDrawer,
        toggleRoadBar: toggleRoadBar,
        setRoadType: setRoadType,
        enterMoveMode: function() {
            if (selectedBuildingId) startMoveBuilding(selectedBuildingId);
            else if (typeof showTycoonToast === 'function') showTycoonToast('Önce taşımak istediğiniz binayı seçin.', 'info');
        },
        rotatePlacement: rotatePlacement,
        cancelAction: cancelAction,
        centerCamera: centerCameraOnCampus,
        zoomIn: function() { targetCamera.zoom = Math.min(1.8, targetCamera.zoom + 0.2); requestRender(); },
        zoomOut: function() { targetCamera.zoom = Math.max(0.45, targetCamera.zoom - 0.2); requestRender(); },

        startBuild: startPlacement,
        buyLand: purchaseLand,
        closeLandConfirm: closeLandConfirm,

        upgrade: upgradeBuilding,
        move: startMoveBuilding,
        rotatePlaced: rotatePlacedBuilding,
        sell: sellBuilding,
        deselect: deselectBuilding,

        getState: getCityData,
        syncLevels: syncBuildingLevels,
        resetCity: function() {
            selectedBuildingId = null;
            movingBuildingId = null;
            ghost = null;
            mode = 'select';
            isPaintingRoad = false;

            if (typeof tycoonState !== 'undefined') {
                tycoonState.city = {
                    initialized: true,
                    lands: [0],
                    placedBuildings: [
                        { id: 'b_stadium_' + Date.now().toString(36), type: 'stadium', x: 7, y: 7, rotation: 0, level: 1 }
                    ],
                    roads: []
                };
                tycoonState.buildings = { stadium: 1 };
            }

            rebuildGrid();
            generateDecorations();
            centerCameraOnCampus();
            syncBuildingLevels();
            saveCityState();

            hideBuildPanel();
            hideLandPanel();
            hideBuildingPopup();
            hideRoadBar();
            closeLandConfirm();
            updateToolbar();
            requestRender();
        }
    };
})();
