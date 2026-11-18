const $=s=>document.querySelector(s);let published=[],local=[],filtered=[],current=0,visibleCount=72;const key='atelier_gallery_items_v1';const settingsKey='atelier_cloud_settings_v1';const axes = {
  style: {
    title: '按风格',
    groups: [
      ['qipao', '旗袍与新中式', /旗袍|新中式|中式|汉服|古风|国风|盘扣/],
      ['tailoring', '都市通勤', /西装|通勤|职业|套装|衬衫|铅笔裙|小西服/],
      ['romantic', '蕾丝与礼服', /蕾丝|礼服|洋装|抹胸|纱裙|公主|洛丽塔|蝴蝶结/],
      ['preppy', '格纹与学院风', /学院|格纹|格裙|百褶|水手|海军风/],
      ['dark', '暗色与复古', /哥特|黑色|黑衣|黑裙|暗黑|黑纱|复古|黑白/],
      ['casual', '轻松日常', /居家|休闲|日常|慵懒|运动|卫衣|牛仔|白T|针织|毛衣|浅色/],
      ['editorial', '海报与拼贴', /海报|插画|拼贴|画报|杂志|四格|拼图|封面|孔版|直播|漫画/],
      ['outfits', '时装造型', /穿搭|造型|裙|时尚|长靴|高跟|格纹|外套|眼镜|丝袜/],
      ['portrait', '自然人像', /肖像|写真|人像|自拍|随拍|剪影|背影|回眸|抓拍/],
      ['reference', '参考与未标注']
    ],
  },
  scene: {
    title: '按场景',
    groups: [
      ['mirror', '镜前自拍', /镜前|镜中|镜面|镜子|对镜|镜自拍|镜边/],
      ['home', '客厅与居家', /客厅|沙发|家中|居家|卧室|床头|床边|地毯/],
      ['coast', '海边与露台', /海边|海滩|海景|海岸|海滨|海面|沙滩|露台|海风|游艇/],
      ['outdoors', '花园与户外', /户外|花园|草地|林荫|公园|长椅|花田|草坡|树林|夕阳海滩|湖畔|栈道/],
      ['city', '街头与建筑', /街头|街拍|天台|楼梯|校园|走廊|栏杆|楼阁|街道|城市|古宅/],
      ['window', '窗边与光影', /窗边|窗前|窗棂|窗光|窗台|玻璃窗|光影|窗帘|落地窗/],
      ['venues', '酒店与公共室内', /酒店|餐厅|咖啡|会所|旅馆|餐桌|吧台/],
      ['studio', '影棚与背景', /影棚|摄影棚|棚拍|纯色背景|紫色背景|薰衣草背景/],
      ['minimal', '极简墙面', /白墙|素墙|空白墙|踢脚线|背景板/],
      ['indoors', '其他室内', /室内|背景/],
      ['unspecified', '场景未标注']
    ],
  }
};
const pageSize=72;
function galleryUrl(url) {
  return typeof url==='string' && (/^https:\/\//.test(url) || /^images\/(?:thumbs\/)?atelier-\d+\.webp$/.test(url));
}
function safeItems(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item=>item&&galleryUrl(item.url)).map(item=>({
    url:item.url,
    thumbnail:galleryUrl(item.thumbnail)?item.thumbnail:'',
    title:String(item.title||'未命名作品'),
    category:String(item.category||'其他'),
    tags:Array.isArray(item.tags)?item.tags.map(String):[],
    created:String(item.created||''),
    ...(item.hidden===true?{hidden:true}:{})
  }));
}
function all() {
  const entries = new Map(published.map(item => [item.url, item]));
  const localOnly = local.filter(item => !entries.has(item.url));
  return [...new Map(localOnly.map(item => [item.url, item])).values(), ...entries.values()];
}
// Photo numbers are stable across full-size and thumbnail URLs.
function photoNumbers(ranges) {
  return new Set(ranges.split(' ').flatMap(range => {
    const [first, last = first] = range.split('-').map(Number);
    return Array.from({length: last - first + 1}, (_, index) => first + index);
  }));
}

const reviewedScenes = new Map();
const sceneReviews = {
  coast: '28 456 465-468 478-481 483 546-561 591-592 601-602 612 615 618 641 907 911-912 925',
  city: '56-57 69 167 260 305 391 393 396 786 792 857 914 921 927 1041',
  outdoors: '128-132 136-157 248-255 267-273 281-290 344-355 356-376 420 451 694 696 779 854 926 1049-1050',
  mirror: '49 119 228 235 239 262-266 272 295 334 340 349 361 392 414 428-435 439 444 486 511-514 648 654 657-669 707 732 748 827 849 861 885 935 960 1016-1020 1036-1037',
  home: '12 51 97-115 118 120-126 317 495 501-508 510 517 520-521 525 533 564 570 596 649 653 655 670-671 676-678 682-683 688-691 699-711 722 821 891 893-896 941 944-951 956-965 977 981-988 994-995 1004 1032-1033 1038',
  window: '288 923-924 928 931 942',
  venues: '73 79 116 243 253 515 528 640 785 839 841 847 898 901-902 922 950 952 975 997-998 1022 1044',
  studio: '95-96 307 377-387 629-644 685-686 816-820 860-874 904 993',
  minimal: '10-11 13-15 29-47 52-55 59-68 71-91 93-94 127 133-135 159-166 225-234 236-238 247 256-259 261 274-280 298-304 308-314 318-331 335-339 341-348 394-397 401-415 419-427 436-438 452-453 469-477 485 488-498 526-545 576-587 619-627 675 679-680 684 687 695 697-698 704 713-717 721 726-730 735-758 766-778 787-791 794-811 822-826 828-838 840 842-848 852 855 866 875 878 880 899-900 961 969 976 1008-1012 1024-1029 1035 1039-1040 1045-1051',
};
for (const [group, ranges] of Object.entries(sceneReviews)) {
  for (const id of photoNumbers(ranges)) if (!reviewedScenes.has(id)) reviewedScenes.set(id, group);
}
const reviewedIndoor = photoNumbers('10 11 12 14 15 28 29 30 31 32 33 39 42 43 44 45 46 47 51 52 54 55 56 57 59 60 64 65 67 68 69 71 72 73 74 75 76 77 78 79 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 111 112 113 114 115 116 117 118 120 122 124 125 127 128 130 131 132 133 134 135 139 140 143 155 156 159 160 161 162 163 166 225 226 227 228 229 230 231 232 233 234 236 237 238 240 241 242 243 244 245 246 247 248 251 253 256 257 259 260 261 267 268 269 274 275 276 277 279 280 281 282 283 286 288 289 298 299 300 301 302 303 304 305 307 308 309 311 312 313 314 317 318 320 321 322 323 324 326 327 328 329 330 331 335 336 338 339 340 341 342 343 345 346 347 348 352 356 357 358 359 360 362 363 364 366 367 369 370 371 372 373 374 375 376 377 378 379 381 382 383 385 387 391 393 394 395 396 397 401 402 403 404 405 407 409 410 411 412 415 419 421 422 427 430 435 436 437 438 444 452 453 465 466 467 468 469 470 471 472 473 474 475 476 477 478 479 480 481 485 488 489 494 495 496 497 498 501 506 507 508 510 511 513 514 515 517 520 521 525 526 527 528 529 530 531 532 534 539 540 541 543 544 545 548 549 553 558 559 560 561 564 570 576 579 580 581 582 584 587 596 619 620 621 622 623 624 625 626 627 629 630 632 635 640 642 643 644 649 653 655 670 671 675 676 678 679 680 681 682 683 684 685 686 687 688 689 690 691 694 695 697 698 700 701 702 703 704 706 710 715 717 721 722 726 727 729 730 735 737 738 740 742 743 746 750 751 753 754 755 756 757 758 759 765 767 768 769 770 771 772 773 774 775 776 777 778 780 781 782 783 784 785 786 787 789 790 791 793 794 795 796 800 802 803 807 808 810 811 813 814 815 816 817 819 820 821 822 823 824 825 826 828 829 831 833 838 839 840 841 842 846 847 848 849 852 855 860 865 866 868 869 874 875 878 880 891 893 896 898 899 900 901 902 904 913 915 916 917 918 919 922 923 924 926 931 941 942 944 946 948 950 951 952 956 957 958 961 963 965 969 975 976 977 981 982 983 984 986 987 988 993 994 995 997 998 1004 1008 1009 1010 1012 1022 1024 1028 1029 1032 1035 1037 1038 1039 1040 1041 1044 1045 1047 1048 1050 1051');
const reviewedStyles = new Map();
const styleReviews = {
  qipao: '14 47 72-73 233 298 308-313 341-345 347-348 391-396 596 649 655 855 866 880 893-902 941 969 1028',
  preppy: '10-11 39 54-55 93 97-115 120-127 291-295 314 395 427 436 438 452-453 469-477 485 488-498 787-792 794 822-823 842-846 1039-1040',
  tailoring: '236-238 247 256-259 280 298-305 317-336 338-339 681 743 750 756-759 818-819 838 840 842 848',
  editorial: '412 477 482 484-485 488 678 682 699-711 769-777 780-784 802 813 815 913-919 965-967 977 986 994-995 997-998 1004',
  romantic: '27-34 44-46 52 59-65 116-117 225-234 240-246 261 274-277 307 320 377-387 397 401-414 428-435 526-534 539-545 582 587 591-592 619-625 629-644 657-668 677-680 683-684 687-691 697-698 701 716 746-755 766-770 814 820 833 874-875 936-940 956-965 1008-1012 1023-1024 1034 1041-1044',
  dark: '12-13 15 42-43 51 56-57 69 128-132 133 135 244 260 356-376 419-422 444 447 452 497 525 549 570 584 622-627 644-655 670-676 694-695 702-704 713-715 717 721 726-742 743 768-778 807-811 816-819 821 839 852-855 860-872 885 904 916 944-955 957 975-988 993 995 1029 1035 1037-1038 1045-1048 1051',
  casual: '30 66-68 71 74-92 110 119 136-166 228 235 262-273 281-290 349-355 361 386 392 414 420 439 451 501-524 528 547-561 564 576-581 601-618 641 662-669 685-688 707 722 732 779 786 793 795-803 824-832 854 857 861 878 891 907 911-912 914 921-931 935 942 960-961 1016-1020 1033 1036 1049-1050',
};
for (const [group, ranges] of Object.entries(styleReviews)) {
  for (const id of photoNumbers(ranges)) if (!reviewedStyles.has(id)) reviewedStyles.set(id, group);
}

function categorize(photo, axis) {
  const keywords = [photo.title, ...photo.tags].filter(tag => tag !== '参考图').join(' ');
  if (axis === 'style' && photo.category === '插画与海报') return 'editorial';
  const group = axes[axis].groups.find(([, , pattern]) => pattern?.test(keywords));
  if (group) return group[0];
  const id = Number(photo.url.match(/^images\/atelier-(\d+)\.webp$/)?.[1]);
  if (axis === 'scene' && reviewedIndoor.has(id)) return reviewedScenes.get(id) || 'indoors';
  if (axis === 'style' && reviewedStyles.has(id)) return reviewedStyles.get(id);
  if (axis === 'style' && photo.category === '穿搭造型') return 'outfits';
  if (axis === 'style' && photo.category === '日常写真') return 'portrait';
  if (axis === 'scene' && photo.category === '室内自拍') return 'indoors';
  if (axis === 'scene' && photo.category === '户外街拍') return 'outdoors';
  return axis === 'style' ? 'reference' : 'unspecified';
}

function route() {
  const [path, query] = location.hash.slice(1).split('?', 2);
  const [root, axis, id] = path.split('/');
  if (root !== 'gallery') return {};
  if (axis === 'search') return {query: new URLSearchParams(query).get('q')?.trim() || ''};
  if (!Object.hasOwn(axes, axis)) return {};
  return {axis, group: axes[axis].groups.find(group => group[0] === id)};
}

function collectionCard(axis, [id, title], photos) {
  const card = document.createElement('a');
  card.className = 'collection-card';
  card.href = '#gallery/' + axis + '/' + id;
  const cover = document.createElement('img');
  const photo = photos[0];
  if (photo) cover.src = photo.thumbnail || photo.url;
  cover.alt = '';
  cover.loading = 'lazy';
  cover.decoding = 'async';
  const caption = document.createElement('div');
  const heading = document.createElement('h3');
  heading.textContent = title;
  const count = document.createElement('span');
  count.textContent = photos.length + ' 张 · 浏览 ›';
  caption.append(heading, count);
  card.append(cover, caption);
  return card;
}

function renderIndex(visible, selectedAxis) {
  const index = $('#collectionIndex');
  index.replaceChildren();
  for (const [axis, config] of Object.entries(axes)) {
    if (selectedAxis && selectedAxis !== axis) continue;
    const section = document.createElement('section');
    section.className = 'collection-section';
    const h = document.createElement('h2');
    h.textContent = config.title;
    const cards = document.createElement('div');
    cards.className = 'collection-cards';
    for (const group of config.groups) {
      const matches = visible.filter(photo => categorize(photo, axis) === group[0]);
      if (matches.length) cards.append(collectionCard(axis, group, matches));
    }
    section.append(h, cards);
    index.append(section);
  }
}

function renderPhoto(photo, index) {
  const figure = document.createElement('figure');
  figure.className = 'tile';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'photo-open';
  const image = document.createElement('img');
  image.src = photo.thumbnail || photo.url;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  const meta = document.createElement('div');
  meta.className = 'meta';
  const title = document.createElement('strong');
  title.textContent = photo.title;
  meta.append(title);
  button.append(image, meta);
  button.onclick = () => show(index);
  figure.append(button);
  return figure;
}

let galleryLoaded = false;
function render() {
  const {axis, group, query} = route();
  const visible = all().filter(photo => !photo.hidden);
  const hasAlbum = Boolean(group || query);
  $('#archiveCount').textContent = galleryLoaded ? visible.length + ' 张作品' : '';
  $('#galleryLoad').hidden = galleryLoaded;
  $('#empty').hidden = !galleryLoaded || visible.length > 0 || hasAlbum;
  $('#collectionView').hidden = !hasAlbum;
  $('#collectionIndex').hidden = hasAlbum || !visible.length;
  for (const tab of $('#collectionTabs').querySelectorAll('a')) {
    if (tab.dataset.axis === (axis || '') && !query) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  if (!hasAlbum) {
    filtered = [];
    renderIndex(visible, axis);
    $('#grid').replaceChildren();
    return;
  }

  const search = query?.toLowerCase();
  filtered = group
    ? visible.filter(photo => categorize(photo, axis) === group[0])
    : visible.filter(photo => [photo.title, photo.category, ...photo.tags,
      ...Object.entries(axes).map(([name, config]) => config.groups.find(entry => entry[0] === categorize(photo, name))[1])
    ].join(' ').toLowerCase().includes(search));
  const back = $('#collectionBack');
  back.href = axis ? '#gallery/' + axis : '#gallery';
  back.textContent = axis ? '‹ ' + axes[axis].title : '‹ 返回图集';
  $('#collectionTitle').textContent = group ? group[1] : '搜索「' + query + '」';
  $('#count').textContent = filtered.length + ' 张作品';
  $('#grid').replaceChildren(...filtered.slice(0, visibleCount).map(renderPhoto));
  $('#noResults').hidden = !galleryLoaded || filtered.length > 0;
  $('#more').hidden = filtered.length <= visibleCount;
}

function openSearch() {
  const query = $('#search').value.trim();
  location.hash = query ? 'gallery/search?q=' + encodeURIComponent(query) : 'gallery';
}

$('#gallerySearch').onsubmit = event => {
  event.preventDefault();
  openSearch();
};
window.addEventListener('hashchange', () => {
  visibleCount = pageSize;
  $('#search').value = route().query || '';
  render();
  if (location.hash.startsWith('#gallery/')) {
    const heading = $('#collectionView').hidden ? $('#collectionIndex') : $('#collectionTitle');
    if (!$('#collectionView').hidden) heading.focus({preventScroll: true});
    heading.scrollIntoView({block: 'start'});
  }
});
$('#search').value = route().query || '';

function show(i){if(!filtered.length)return;current=(i+filtered.length)%filtered.length;const x=filtered[current];openPhoto=x;$('#hidePhoto').hidden=!githubToken||!published.some(entry=>entry.url===x.url);$('#bigImg').src=x.url;$('#bigImg').alt=x.title;$('#bigTitle').textContent=x.title;$('#bigInfo').textContent=[x.category,...x.tags].join(' · ');$('#openOriginal').href=x.url;$('#openOriginal').textContent=x.thumbnail?'查看大图 ↗':'查看原图 ↗';$('#viewer').showModal()}
$('#prev').onclick=()=>show(current-1);$('#next').onclick=()=>show(current+1);$('#more').onclick=()=>{visibleCount+=pageSize;render()};$('#adminToggle').onclick=()=>$('#admin').showModal();$('#emptyAdd').onclick=()=>$('#admin').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());document.addEventListener('keydown',e=>{if(!$('#viewer').open||$('#hideConfirm').open)return;if(e.key==='ArrowLeft')show(current-1);if(e.key==='ArrowRight')show(current+1)});
function loadSettings(){try{return JSON.parse(localStorage.getItem(settingsKey)||'{}')}catch{return {}}}const config=loadSettings();$('#cloudName').value=config.cloudName||'';$('#uploadPreset').value=config.preset||'';$('#saveSettings').onclick=()=>{localStorage.setItem(settingsKey,JSON.stringify({cloudName:$('#cloudName').value.trim(),preset:$('#uploadPreset').value.trim()}));$('#status').textContent='本机配置已保存。'};
$('#files').onchange=async e=>{const files=[...e.target.files];const cloud=$('#cloudName').value.trim(),preset=$('#uploadPreset').value.trim();if(!cloud||!preset){$('#status').textContent='请先填写 Cloud name 和 unsigned upload preset。';return}if(!/^[a-zA-Z0-9_-]+$/.test(cloud)){ $('#status').textContent='Cloud name 格式不正确。';return}$('#saveSettings').click();let ok=0;for(const file of files){if(!file.type.startsWith('image/'))continue;$('#status').textContent=`正在上传 ${ok+1}/${files.length}：${file.name}`;const body=new FormData();body.append('file',file);body.append('upload_preset',preset);try{const r=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,{method:'POST',body});const d=await r.json();if(!r.ok||!d.secure_url)throw Error(d.error?.message||'上传失败');local.unshift({url:d.secure_url,title:file.name.replace(/\.[^.]+$/,''),category:$('#category').value,tags:$('#tags').value.split(/[,，]/).map(x=>x.trim()).filter(Boolean),created:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(local));ok++;render()}catch(err){$('#status').textContent+=`\n${file.name}: ${err.message}`;break}}$('#status').textContent+=`\n已成功上传 ${ok} 张。请导出图库数据并发布。`;e.target.value=''};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(all(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='gallery.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};$('#clearLocal').onclick=()=>{if(!confirm('仅清空此浏览器的新增记录，不会删除 Cloudinary 图片或网站已发布的数据。确定？'))return;local=[];localStorage.removeItem(key);render()};
(async()=>{try{local=safeItems(JSON.parse(localStorage.getItem(key)||'[]'))}catch{}try{const r=await fetch('gallery.json',{cache:'no-store'});if(!r.ok)throw new Error();const entries=await r.json();if(!githubToken)published=safeItems(entries)}catch{ $('#galleryLoad').textContent = '暂时无法加载图集，请刷新重试。'; return; }galleryLoaded = true; render()})();

const githubRepository = 'https://api.github.com/repos/babycool252/myphoto';
const galleryEndpoint = githubRepository + '/contents/gallery.json';
let githubToken = '';
let visibilityBusy = false;
let openPhoto;
let photoToHide;

async function githubRequest(url, token, options = {}) {
  const response = await fetch(url, {
    credentials: 'omit',
    redirect: 'error',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers
    }
  });
  if (!response.ok) {
    const message = ({
      401: '令牌无效或已过期。请重新连接 GitHub。',
      403: 'GitHub 拒绝访问。请检查 myphoto 仓库授权和 Contents 读写权限。',
      404: '无法访问 myphoto 仓库。请检查令牌选择的仓库。',
      409: '有其他更改先提交了。请重试。',
      422: 'GitHub 未接受这次提交。请检查仓库设置和令牌权限。'
    })[response.status] || 'GitHub 暂时不可用，请重试。';
    throw Object.assign(new Error(message), {status: response.status});
  }
  return response.json();
}

async function readGitHubGallery(token) {
  const {sha, content} = await githubRequest(galleryEndpoint + '?ref=main', token);
  if (!sha || typeof content !== 'string') throw new Error('无法读取图库索引。');
  const bytes = Uint8Array.from(atob(content), char => char.charCodeAt(0));
  const entries = JSON.parse(new TextDecoder().decode(bytes));
  if (!Array.isArray(entries)) throw new Error('图库索引格式有误。');
  return {sha, entries};
}

function encodeGallery(entries) {
  const bytes = new TextEncoder().encode(JSON.stringify(entries, null, 2) + '\n');
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return btoa(binary);
}

function renderVisibility() {
  $('#githubConnect').hidden = Boolean(githubToken);
  $('#githubConnected').hidden = !githubToken;
  $('#githubConnectButton').disabled = visibilityBusy;
  $('#githubDisconnect').disabled = visibilityBusy;
  $('#hideSubmit').disabled = visibilityBusy;
  $('#hideCancel').disabled = visibilityBusy;
  const hidden = githubToken ? published.filter(photo => photo.hidden) : [];
  $('#hiddenEmpty').hidden = hidden.length > 0;
  $('#hiddenPhotos').replaceChildren(...hidden.map(photo => {
    const row = document.createElement('li');
    const image = document.createElement('img');
    image.src = photo.thumbnail || photo.url;
    image.alt = '';
    image.loading = 'lazy';
    const name = document.createElement('span');
    name.textContent = photo.title;
    const restore = document.createElement('button');
    restore.type = 'button';
    restore.className = 'secondary';
    restore.textContent = '恢复展示';
    restore.setAttribute('aria-label', '恢复展示：' + photo.title);
    restore.disabled = visibilityBusy;
    restore.onclick = () => updateVisibility(photo, false, $('#visibilityStatus'));
    row.append(image, name, restore);
    return row;
  }));
}

$('#githubConnect').onsubmit = async event => {
  event.preventDefault();
  if (visibilityBusy) return;
  const input = $('#githubToken');
  const token = input.value.trim();
  input.value = '';
  const status = $('#visibilityStatus');
  if (!/^github_pat_[A-Za-z0-9_]+$/.test(token)) {
    status.textContent = '请输入 GitHub 细粒度访问令牌。';
    return;
  }

  visibilityBusy = true;
  status.textContent = '正在连接 GitHub…';
  renderVisibility();
  try {
    const [repo, gallery] = await Promise.all([
      githubRequest(githubRepository, token),
      readGitHubGallery(token)
    ]);
    if (!repo.permissions?.push) throw new Error('此令牌的账号没有 myphoto 仓库的写入权限。');
    githubToken = token;
    published = safeItems(gallery.entries);
    galleryLoaded = true;
    render();
    status.textContent = '已连接。打开已发布的图片即可隐藏。';
  } catch (error) {
    status.textContent = error.message || '连接失败，请重试。';
  } finally {
    visibilityBusy = false;
    renderVisibility();
  }
};

$('#githubDisconnect').onclick = () => {
  githubToken = '';
  $('#visibilityStatus').textContent = '已断开连接。';
  renderVisibility();
};

$('#hidePhoto').onclick = () => {
  if (!githubToken || !openPhoto || visibilityBusy) return;
  photoToHide = openPhoto;
  $('#hideTitle').textContent = openPhoto.title;
  $('#hideStatus').textContent = '';
  $('#hideConfirm').showModal();
};

$('#hideConfirm').addEventListener('cancel', event => {
  if (visibilityBusy) event.preventDefault();
});
$('#hideCancel').onclick = () => $('#hideConfirm').close();
$('#hideSubmit').onclick = () => updateVisibility(photoToHide, true, $('#hideStatus'));

async function updateVisibility(photo, hidden, status) {
  if (!photo || !githubToken || visibilityBusy) return;
  visibilityBusy = true;
  status.textContent = '正在保存…';
  renderVisibility();
  try {
    for (let attempt = 0; ; attempt++) {
      const {entries, sha} = await readGitHubGallery(githubToken);
      const matching = entries.filter(entry => entry?.url === photo.url);
      if (!matching.length) throw new Error('此图片已从图库索引移除，请刷新页面。');
      if (matching.some(entry => (entry.hidden === true) !== hidden)) {
        for (const entry of matching) {
          if (hidden) entry.hidden = true;
          else delete entry.hidden;
        }
        try {
          await githubRequest(galleryEndpoint, githubToken, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              message: hidden ? 'Hide photo from ATELIER gallery' : 'Restore photo to ATELIER gallery',
              content: encodeGallery(entries),
              sha,
              branch: 'main'
            })
          });
        } catch (error) {
          if (error.status === 409 && attempt === 0) continue;
          throw error;
        }
      }
      published = safeItems(entries);
      break;
    }
    render();
    const message = hidden ? '已提交隐藏。GitHub Pages 发布后对访客生效。' : '已提交恢复。GitHub Pages 发布后对访客生效。';
    $('#visibilityStatus').textContent = message;
    $('#galleryNotice').textContent = message;
    $('#galleryNotice').hidden = false;
    if (hidden) {
      $('#hideConfirm').close();
      $('#viewer').close();
    }
  } catch (error) {
    status.textContent = error.message || '保存失败，请重试。';
  } finally {
    visibilityBusy = false;
    renderVisibility();
  }
}
