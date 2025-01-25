const SearchBar = () => {
  return (
    <div className="search-bar">
      <form className="search-form flex items-center" method="POST" action="#">
        <input
          type="text"
          name="query"
          placeholder="Search"
          title="Enter Search Keyword"
        />
        <button type="submit" title="Search">
          <i className="bi bi-search"></i>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
