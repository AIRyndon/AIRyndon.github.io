(() => {
  // <stdin>
  (() => {
    let searchIndex = null;
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        searchIndex = JSON.parse(request.responseText);
      }
    };
    request.open("GET", "/index.json");
    request.send();
    const search = async (query, index) => {
      const regex = new RegExp(query.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const keys = ["permalink", "tags", "title"];
      const result = index.filter((value) => {
        for (const key of keys) {
          if (!value[key])
            continue;
          if (Array.isArray(value[key])) {
            if (value[key].some((v) => regex.test(v.toLowerCase())))
              return true;
          } else if (regex.test(value[key].toLowerCase()))
            return true;
        }
      });
      if (result.length > 0) {
        const ul = document.createElement("ul");
        ul.setAttribute("class", "pt-1");
        result.forEach((item) => {
          const li = document.createElement("li");
          const aTag = document.createElement("a");
          li.setAttribute("class", "px-1 py-1");
          aTag.setAttribute("href", item.permalink);
          aTag.setAttribute("class", "is-block");
          aTag.innerHTML = item.title;
          li.appendChild(aTag);
          ul.appendChild(li);
        });
        return ul;
      }
      return null;
    };
    const searchResult = document.getElementById("search-result");
    const searchInput = document.getElementById("search-input");
    searchInput?.addEventListener("input", async (e) => {
      let result = null;
      if (e.currentTarget.value)
        result = await search(e.currentTarget.value, searchIndex);
      if (searchResult.lastChild)
        searchResult.removeChild(searchResult.lastChild);
      if (result)
        searchResult.appendChild(result);
    });
    searchInput?.addEventListener("focusout", (e) => {
      e.target.value = "";
      setTimeout(() => {
        if (searchResult.lastChild)
          searchResult.removeChild(searchResult.lastChild);
      }, 150);
    });
  })();
})();
