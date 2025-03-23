
let currentMovie = null;

async function fetchMovies() {
    try {
        const response = await fetch('http://localhost:3000/films');
        const movies = await response.json();
        const filmList = document.getElementById('films');
        filmList.innerHTML = ''; 
        
        movies.forEach(movie => {
            const li = document.createElement('li');
            li.className = 'film item';
            
            if (movie.capacity - movie.tickets_sold === 0) {
                li.classList.add('sold-out');
            }
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = movie.title;
            titleSpan.addEventListener('click', () => displayMovie(movie));
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => deleteMovie(movie, li));
            
            li.appendChild(titleSpan);
            li.appendChild(deleteButton);
            filmList.appendChild(li);
        });

        if (movies.length > 0) {
            displayMovie(movies[0]);
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

function displayMovie(movie) {
    currentMovie = movie;
    document.getElementById('moviePoster').src = movie.poster;
    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('movieRuntime').textContent = movie.runtime;
    document.getElementById('movieShowtime').textContent = movie.showtime;
    document.getElementById('availableTickets').textContent = movie.capacity - movie.tickets_sold;
    
    const buyButton = document.getElementById('buyTicket');
    if (movie.capacity - movie.tickets_sold === 0) {
        buyButton.textContent = 'Sold Out';
        buyButton.disabled = true;
    } else {
        buyButton.textContent = 'Buy Ticket';
        buyButton.disabled = false;
    }
}

async function deleteMovie(movie, listItem) {
    try {
        await fetch(`http://localhost:3000/films/${movie.id}`, {
            method: 'DELETE',
        });
        listItem.remove();
    } catch (error) {
        console.error('Error deleting movie:', error);
    }
}

document.getElementById('buyTicket').addEventListener('click', async function() {
    if (!currentMovie) return;
    
    let availableTickets = parseInt(document.getElementById('availableTickets').textContent);
    if (availableTickets > 0) {
        availableTickets--;
        document.getElementById('availableTickets').textContent = availableTickets;
        
        try {
            await fetch(`http://localhost:3000/films/${currentMovie.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickets_sold: currentMovie.tickets_sold + 1 })
            });
            currentMovie.tickets_sold++;
            
            await fetch(`http://localhost:3000/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    movie_id: currentMovie.id,
                    quantity: 1
                })
            });
            
            if (availableTickets === 0) {
                document.getElementById('buyTicket').textContent = 'Sold Out';
                document.getElementById('buyTicket').disabled = true;
                document.querySelectorAll('.film').forEach(li => {
                    if (li.textContent.includes(currentMovie.title)) {
                        li.classList.add('sold-out');
                    }
                });
            }
        } catch (error) {
            console.error('Error updating tickets:', error);
        }
    } else {
        alert('Tickets are sold out!');
    }
});

document.addEventListener('DOMContentLoaded', fetchMovies);
