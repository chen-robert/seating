const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const cleanName = name => {
  const parts = name.split(",").map(a => a.trim().charAt(0).toUpperCase());
  
  return parts[1] + parts[0]; 
}

const permute = (arr, lim, fn, idx=0, base=[]) => {
  if(base.length === lim) return fn(base.concat());

  for(let i = idx; i < arr.length; i++) {
    base.push(i);
    permute(arr, lim, fn, i + 1, base);
    base.pop();
  }
}

const unique = arr => arr.filter((i, idx, arr) => arr.indexOf(i) === idx);