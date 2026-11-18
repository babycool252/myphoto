const $=s=>document.querySelector(s);let published=[],local=[],filtered=[],active='全部',current=0,visibleCount=72;const key='atelier_gallery_items_v1';const settingsKey='atelier_cloud_settings_v1';const categories=['全部','日常写真','穿搭造型','室内自拍','户外街拍','插画与海报','参考图','其他'];
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
function render(){const q=$('#search').value.trim().toLowerCase();const visible=all().filter(x=>!x.hidden);filtered=visible.filter(x=>(active==='全部'||x.category===active)&&(!q||[x.title,x.category,...x.tags].join(' ').toLowerCase().includes(q)));$('#count').textContent=`(${filtered.length})`;$('#heroCount').textContent=String(visible.length).padStart(2,'0')+' IMAGES';$('#filters').replaceChildren(...categories.map(c=>{const b=document.createElement('button');b.className='filter'+(c===active?' active':'');b.textContent=c;b.onclick=()=>{active=c;visibleCount=pageSize;render()};return b}));const grid=$('#grid');grid.replaceChildren();filtered.slice(0,visibleCount).forEach((x,i)=>{const figure=document.createElement('figure');figure.className='tile';const img=document.createElement('img');img.src=x.thumbnail||x.url;img.alt=x.title;img.loading='lazy';img.decoding='async';const meta=document.createElement('div');meta.className='meta';const title=document.createElement('strong');title.textContent=x.title;const cat=document.createElement('small');cat.textContent=x.category;meta.append(title,cat);figure.append(img,meta);figure.onclick=()=>show(i);grid.append(figure)});$('#empty').hidden=visible.length>0;$('#noResults').hidden=!visible.length||filtered.length>0;$('#more').hidden=filtered.length<=visibleCount}
function show(i){if(!filtered.length)return;current=(i+filtered.length)%filtered.length;const x=filtered[current];openPhoto=x;$('#hidePhoto').hidden=!githubToken||!published.some(entry=>entry.url===x.url);$('#bigImg').src=x.url;$('#bigImg').alt=x.title;$('#bigTitle').textContent=x.title;$('#bigInfo').textContent=[x.category,...x.tags].join(' · ');$('#openOriginal').href=x.url;$('#openOriginal').textContent=x.thumbnail?'查看大图 ↗':'查看原图 ↗';$('#viewer').showModal()}
$('#prev').onclick=()=>show(current-1);$('#next').onclick=()=>show(current+1);$('#search').oninput=()=>{visibleCount=pageSize;render()};$('#more').onclick=()=>{visibleCount+=pageSize;render()};$('#adminToggle').onclick=()=>$('#admin').showModal();$('#emptyAdd').onclick=()=>$('#admin').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());document.addEventListener('keydown',e=>{if(!$('#viewer').open||$('#hideConfirm').open)return;if(e.key==='ArrowLeft')show(current-1);if(e.key==='ArrowRight')show(current+1)});
function loadSettings(){try{return JSON.parse(localStorage.getItem(settingsKey)||'{}')}catch{return {}}}const config=loadSettings();$('#cloudName').value=config.cloudName||'';$('#uploadPreset').value=config.preset||'';$('#saveSettings').onclick=()=>{localStorage.setItem(settingsKey,JSON.stringify({cloudName:$('#cloudName').value.trim(),preset:$('#uploadPreset').value.trim()}));$('#status').textContent='本机配置已保存。'};
$('#files').onchange=async e=>{const files=[...e.target.files];const cloud=$('#cloudName').value.trim(),preset=$('#uploadPreset').value.trim();if(!cloud||!preset){$('#status').textContent='请先填写 Cloud name 和 unsigned upload preset。';return}if(!/^[a-zA-Z0-9_-]+$/.test(cloud)){ $('#status').textContent='Cloud name 格式不正确。';return}$('#saveSettings').click();let ok=0;for(const file of files){if(!file.type.startsWith('image/'))continue;$('#status').textContent=`正在上传 ${ok+1}/${files.length}：${file.name}`;const body=new FormData();body.append('file',file);body.append('upload_preset',preset);try{const r=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`,{method:'POST',body});const d=await r.json();if(!r.ok||!d.secure_url)throw Error(d.error?.message||'上传失败');local.unshift({url:d.secure_url,title:file.name.replace(/\.[^.]+$/,''),category:$('#category').value,tags:$('#tags').value.split(/[,，]/).map(x=>x.trim()).filter(Boolean),created:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(local));ok++;render()}catch(err){$('#status').textContent+=`\n${file.name}: ${err.message}`;break}}$('#status').textContent+=`\n已成功上传 ${ok} 张。请导出图库数据并发布。`;e.target.value=''};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(all(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='gallery.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};$('#clearLocal').onclick=()=>{if(!confirm('仅清空此浏览器的新增记录，不会删除 Cloudinary 图片或网站已发布的数据。确定？'))return;local=[];localStorage.removeItem(key);render()};
(async()=>{try{local=safeItems(JSON.parse(localStorage.getItem(key)||'[]'))}catch{}try{const r=await fetch('gallery.json',{cache:'no-store'});if(r.ok){const entries=await r.json();if(!githubToken)published=safeItems(entries)}}catch{}render()})();

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
