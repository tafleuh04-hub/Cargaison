<!-- Le comportement sera :

Maritime → 50 000 kg automatiquement
Aérien → 5 000 kg automatiquement
Routier → 25 000 kg automatiquement -->


interface ICargaison {
    numero: string;
    type: string;
    dateDepart: string;
    lieuDepart: {
        pays: string;
    };
    lieuArrivee: {
        pays: string;
    };
    distance: number;
    poidsMax: number;
    etatAvancement: string;
    etatGlobal: string;
}

class CargaisonFetcher {
    private endpoint = "http://localhost:3000/cargaisons";

    private async fetchCargaisons(): Promise<ICargaison[]> {
        try {
            const response = await fetch(this.endpoint);
            return await response.json();
        } catch (error) {
            console.error("Erreur:", error);
            return [];
        }
    }

    async getTotal(): Promise<number> {
        const cargaisons = await this.fetchCargaisons();
        return cargaisons.length;
    }

    async getOuvertes(): Promise<number> {
        const cargaisons = await this.fetchCargaisons();
        return cargaisons.filter(c => c.etatGlobal === "OUVERT").length;
    }

    async getEnCours(): Promise<number> {
        const cargaisons = await this.fetchCargaisons();
        return cargaisons.filter(c => c.etatAvancement === "EN_COURS").length;
    }

    async getFermees(): Promise<number> {
        const cargaisons = await this.fetchCargaisons();
        return cargaisons.filter(c => c.etatGlobal === "FERME").length;
    }

    private getIconClass(type: string): string {
        switch(type) {
            case "MARITIME": return "fa-ship text-cyan-400";
            case "AERIEN": return "fa-plane text-gray-400";
            case "ROUTIER": return "fa-truck text-cyan-400";
            default: return "fa-box text-gray-400";
        }
    }

    async displayCargaisons(): Promise<void> {
        const cargaisons = await this.fetchCargaisons();
        const tableBody = document.getElementById("cargo-table-body");
        
        if (!tableBody) return;
        
        tableBody.innerHTML = cargaisons.map(cargaison => `
            <tr class="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all group">
                <td class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center">
                            <i class="fas ${this.getIconClass(cargaison.type)}"></i>
                        </div>
                        <div>
                            <span class="text-white font-mono font-semibold">${cargaison.numero}</span>
                            <p class="text-gray-400 text-xs">Créé le ${new Date(cargaison.dateDepart).toLocaleDateString()}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-cyan-400 rounded-full"></div>
                        <span class="text-cyan-400 font-medium">${cargaison.type}</span>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-gray-300">${cargaison.lieuDepart.pays}</span>
                        <i class="fas fa-arrow-right text-gray-500 text-xs"></i>
                        <span class="text-gray-300">${cargaison.lieuArrivee.pays}</span>
                    </div>
                    <p class="text-gray-500 text-xs">${Math.round(cargaison.distance)} km</p>
                </td>
                <td class="p-4">
                    <div class="text-gray-300">
                        <span class="font-semibold"></span> ${cargaison.poidsMax} kg
                    </div>
                    <div class="w-full bg-gray-600 rounded-full h-2 mt-1">
                        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </td>
                <td class="p-4">
                    <span class="inline-flex items-center px-3 py-1 bg-gray-600/20 text-gray-300 border border-gray-500/30 rounded-full text-xs font-semibold">
                        <div class="w-2 h-2 bg-gray-400 rounded-full mr-2 ${cargaison.etatAvancement === 'EN_COURS' ? 'animate-pulse' : ''}"></div>
                        ${cargaison.etatAvancement}
                    </span>
                </td>
                <td class="p-4">
                    <span class="inline-flex items-center px-3 py-1 ${cargaison.etatGlobal === 'OUVERT' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30' : 'bg-gray-600/20 text-gray-400 border-gray-500/30'} rounded-full text-xs font-semibold border">
                        <div class="w-2 h-2 ${cargaison.etatGlobal === 'OUVERT' ? 'bg-cyan-400' : 'bg-gray-400'} rounded-full mr-2"></div>
                        ${cargaison.etatGlobal}
                    </span>
                </td>
                <td class="p-4">
                    <div class="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="p-2 text-gray-400 hover:bg-gray-500/20 rounded-lg transition-all" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all" title="${cargaison.etatGlobal === 'OUVERT' ? 'Fermer' : 'Ouvrir'}">
                            <i class="fas ${cargaison.etatGlobal === 'OUVERT' ? 'fa-lock-open' : 'fa-lock'}"></i>
                        </button>
                        <button class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async updateStats(): Promise<void> {
        const total = await this.getTotal();
        const ouvertes = await this.getOuvertes();
        const enCours = await this.getEnCours();
        const fermees = await this.getFermees();

        const elements = {
            total: document.querySelector("#total-cargaison"),
            ouvertes: document.querySelector("#cargaison-ouverte"),
            enCours: document.querySelector("#cargaison-enCour"),
            fermees: document.querySelector("#cargaison-fermee")
        };

        if (elements.total) elements.total.textContent = total.toString();
        if (elements.ouvertes) elements.ouvertes.textContent = ouvertes.toString();
        if (elements.enCours) elements.enCours.textContent = enCours.toString();
        if (elements.fermees) elements.fermees.textContent = fermees.toString();
    }

    async filterCargaisons(type?: string, etatAvancement?: string, etatGlobal?: string): Promise<ICargaison[]> {
        const cargaisons = await this.fetchCargaisons();
        return cargaisons.filter(cargaison => {
            const matchType = !type || cargaison.type === type;
            const matchAvancement = !etatAvancement || cargaison.etatAvancement === etatAvancement;
            const matchGlobal = !etatGlobal || cargaison.etatGlobal === etatGlobal;
            return matchType && matchAvancement && matchGlobal;
        });
    }

    async applyFilters(): Promise<void> {
        const typeFilter = document.querySelector<HTMLSelectElement>("#type-filter");
        const avancementFilter = document.querySelector<HTMLSelectElement>("#etat-filter");
        const globalFilter = document.querySelector<HTMLSelectElement>("#global-filter");

        const filteredCargaisons = await this.filterCargaisons(
            typeFilter?.value,
            avancementFilter?.value,
            globalFilter?.value
        );

        const tableBody = document.getElementById("cargo-table-body");
        if (tableBody) {
            tableBody.innerHTML = this.generateTableRows(filteredCargaisons);
        }
    }

    private generateTableRows(cargaisons: ICargaison[]): string {
        return cargaisons.map(cargaison => `
            <tr class="border-b border-gray-700/30 hover:bg-gray-700/30 transition-all group">
                <td class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center">
                            <i class="fas ${this.getIconClass(cargaison.type)}"></i>
                        </div>
                        <div>
                            <span class="text-white font-mono font-semibold">${cargaison.numero}</span>
                            <p class="text-gray-400 text-xs">Créé le ${new Date(cargaison.dateDepart).toLocaleDateString()}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-cyan-400 rounded-full"></div>
                        <span class="text-cyan-400 font-medium">${cargaison.type}</span>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-gray-300">${cargaison.lieuDepart.pays}</span>
                        <i class="fas fa-arrow-right text-gray-500 text-xs"></i>
                        <span class="text-gray-300">${cargaison.lieuArrivee.pays}</span>
                    </div>
                    <p class="text-gray-500 text-xs">${Math.round(cargaison.distance)} km</p>
                </td>
                <td class="p-4">
                    <div class="text-gray-300">
                        <span class="font-semibold"></span> ${cargaison.poidsMax} kg
                    </div>
                    <div class="w-full bg-gray-600 rounded-full h-2 mt-1">
                        <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </td>
                <td class="p-4">
                    <span class="inline-flex items-center px-3 py-1 bg-gray-600/20 text-gray-300 border border-gray-500/30 rounded-full text-xs font-semibold">
                        <div class="w-2 h-2 bg-gray-400 rounded-full mr-2 ${cargaison.etatAvancement === 'EN_COURS' ? 'animate-pulse' : ''}"></div>
                        ${cargaison.etatAvancement}
                    </span>
                </td>
                <td class="p-4">
                    <span class="inline-flex items-center px-3 py-1 ${cargaison.etatGlobal === 'OUVERT' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30' : 'bg-gray-600/20 text-gray-400 border-gray-500/30'} rounded-full text-xs font-semibold border">
                        <div class="w-2 h-2 ${cargaison.etatGlobal === 'OUVERT' ? 'bg-cyan-400' : 'bg-gray-400'} rounded-full mr-2"></div>
                        ${cargaison.etatGlobal}
                    </span>
                </td>
                <td class="p-4">
                    <div class="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="p-2 text-gray-400 hover:bg-gray-500/20 rounded-lg transition-all" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all" title="${cargaison.etatGlobal === 'OUVERT' ? 'Fermer' : 'Ouvrir'}">
                            <i class="fas ${cargaison.etatGlobal === 'OUVERT' ? 'fa-lock-open' : 'fa-lock'}"></i>
                        </button>
                        <button class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const fetcher = new CargaisonFetcher();
    fetcher.displayCargaisons();
    fetcher.updateStats();

    // Ajout des événements pour les filtres
    const filters = ["type-filter", "etat-filter", "global-filter"];
    filters.forEach(filterId => {
        document.getElementById(filterId)?.addEventListener("change", () => {
            fetcher.applyFilters();
        });
    });
});


