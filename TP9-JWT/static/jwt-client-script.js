// Stockage en mémoire (volatile) : plus sûr que localStorage contre les failles XSS
window.lastAccessToken = '';

/**
 * Wrapper autour de fetch() pour gérer l'auth JWT automatiquement.
 */
async function apiFetch(url, options = {}) {
    // 1. Préparer les headers avec le token actuel
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${window.lastAccessToken}`,
        'Content-Type': 'application/json'
    };

    // 2. Tenter la requête
    // credentials: 'include' est CRUCIAL pour envoyer le cookie refreshToken
    let response = await fetch(url, { ...options, headers, credentials: 'include' });

    // 3. Si erreur 401 (Unauthorized), le token est probablement expiré
    if (response.status === 401) {
        console.log('Access Token expiré. Tentative de rafraîchissement...');

        // 4. Appel à l'endpoint de refresh (le cookie est envoyé auto)
        const refreshResponse = await fetch('/token', {
            method: 'POST',
            credentials: 'include'
        });

        if (refreshResponse.ok) {
            // 5. Succès : on récupère le nouveau token
            const data = await refreshResponse.json();
            window.lastAccessToken = data.accessToken;
            console.log('Token rafraîchi !');

            // 6. On rejoue la requête initiale avec le nouveau token
            headers['Authorization'] = `Bearer ${window.lastAccessToken}`;
            response = await fetch(url, { ...options, headers, credentials: 'include' });
        } else {
            // 7. Échec : le refresh token est aussi invalide (ou révoqué)
            console.error('Session expirée. Redirection vers login.');
            window.location.href = '/login';
            throw new Error('Session expirée');
        }
    }

    return response;
}

// --- Logique de la page Profil ---

const btnProfil = document.getElementById('getProfile');
if (btnProfil) {
    btnProfil.addEventListener('click', async () => {
        const divResultat = document.getElementById('resultat');
        divResultat.innerHTML = 'Chargement...';

        try {
            const response = await apiFetch('/profil');

            if (response.ok) {
                const data = await response.json();
                divResultat.innerHTML = `
                    <h3>Profil Utilisateur</h3>
                    <pre>${JSON.stringify(data.user, null, 2)}</pre>
                `;
            } else {
                const err = await response.json();
                divResultat.innerHTML = `<p style="color:red">Erreur : ${err.message}</p>`;
            }
        } catch (e) {
            console.error(e);
            divResultat.innerHTML = `<p style="color:red">Erreur réseau ou session.</p>`;
        }
    });
}