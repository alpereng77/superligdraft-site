import React from 'react';

export default function PenaltyModal() {
    return (
        <div id="penalty-shootout-overlay" className="penalty-overlay hidden">
            <div className="penalty-container">
                <div className="penalty-header">
                    <h2>PENALTI ATIŞLARI</h2>
                    <div className="penalty-desc">
                        120 DAKİKA SONUNDA EŞİTLİK BOZULMADI! KAZANAN PENALTILARLA BELİRLENİYOR
                    </div>
                </div>

                <div className="penalty-teams">
                    <div className="penalty-team home">
                        <div id="pen-home-name" className="team-name">EV SAHİBİ</div>
                        <div id="pen-home-dots" className="penalty-dots"></div>
                        <div id="pen-home-score" className="penalty-score">0</div>
                    </div>

                    <div className="penalty-vs">VS</div>

                    <div className="penalty-team away">
                        <div id="pen-away-name" className="team-name">DEPLASMAN</div>
                        <div id="pen-away-dots" className="penalty-dots"></div>
                        <div id="pen-away-score" className="penalty-score">0</div>
                    </div>
                </div>

                <div className="penalty-live-action">
                    <i className="fa-solid fa-futbol penalty-ball-icon"></i>
                    <div id="penalty-commentary" className="penalty-commentary-text">
                        Penaltı atışları başlamak üzere. Nefesler tutuldu...
                    </div>
                </div>
            </div>
        </div>
    );
}

