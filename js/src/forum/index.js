import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import avatar from 'flarum/common/helpers/avatar';
import Link from 'flarum/common/components/Link';
import Tooltip from 'flarum/common/components/Tooltip';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import humanTime from 'flarum/common/utils/humanTime';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import DiscussionListState from 'flarum/forum/states/DiscussionListState';

function extractFirstImageUrlFromPost(post) {
  if (!post || post.contentType() !== 'comment') {
    return null;
  }

  const html = post.contentHtml();

  if (!html || typeof html !== 'string') {
    return null;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const firstImage = doc.querySelector('img[src]');

  return firstImage ? firstImage.getAttribute('src') : null;
}

function markCoverImageLoaded(imageElement) {
  if (!imageElement) {
    return;
  }

  const coverImage = imageElement.closest('.TuDiscussionCard-coverImage');

  if (!coverImage) {
    return;
  }

  coverImage.classList.add('is-loaded');

  const loadingLayer = coverImage.querySelector('.TuDiscussionCard-coverLoading');
  if (loadingLayer) {
    loadingLayer.remove();
  }
}

app.initializers.add('tu/disscusion-card-theme', () => {
  document.body.classList.add('tu-discussion-card-theme');

  extend(DiscussionListState.prototype, 'requestParams', function (params) {
    if (!params.include.includes('firstPost')) {
      params.include.push('firstPost');
    }
  });

  override(DiscussionListItem.prototype, 'authorAvatarView', function () {
    const discussion = this.attrs.discussion;
    const user = discussion.user();
    const firstImageUrl = extractFirstImageUrlFromPost(discussion.firstPost());

    let avatarChild = avatar(user || null, { title: '' });

    if (firstImageUrl) {
      const handleImageReady = (event) => {
        markCoverImageLoaded(event.currentTarget);
      };

      avatarChild = (
        <span className="TuDiscussionCard-coverImage">
          <span className="TuDiscussionCard-coverLoading" aria-hidden="true">
            <LoadingIndicator size="small" />
          </span>
          <img
            src={firstImageUrl}
            alt=""
            loading="lazy"
            oncreate={(vnode) => {
              if (vnode.dom.complete) {
                markCoverImageLoaded(vnode.dom);
              }
            }}
            onload={handleImageReady}
            onerror={handleImageReady}
          />
        </span>
      );
    }

    return (
      <Tooltip text={app.translator.trans('core.forum.discussion_list.started_text', { user, ago: humanTime(discussion.createdAt()) })} position="right">
        <Link className="DiscussionListItem-author" href={user ? app.route.user(user) : '#'}>
          {avatarChild}
        </Link>
      </Tooltip>
    );
  });
});
