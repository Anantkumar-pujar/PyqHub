document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchBar = document.getElementById('search-bar');
    const categorySelect = document.getElementById('search-category');

    searchButton.addEventListener('click', async () => {
        // Get the input values
        const search = searchBar.value.trim();
        const category = categorySelect.value === "all" ? "" : categorySelect.value; 

        if (!search && !category) {
            alert('Please enter a subject name/code or select a category.');
            return;
        }

        // Build the query parameters
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('subname', search);
        if (category) queryParams.append('category', category);

        // Redirect to the results page with query parameters
        window.location.href = `/search-results?${queryParams.toString()}`;
    });
});
