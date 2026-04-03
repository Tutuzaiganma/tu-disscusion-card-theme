<?php

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Extend;
use Flarum\Post\CommentPost;

function tuDisscusionCardThemeExtractFirstImageUrl(string $content): ?string
{
    if ($content === '') {
        return null;
    }

    if (preg_match_all('/<img\b[^>]*>/i', $content, $imageTags)) {
        foreach ($imageTags[0] as $imageTag) {
            if (preg_match('/\bclass=["\'][^"\']*\bemoji\b[^"\']*["\']/i', $imageTag)) {
                continue;
            }

            if (preg_match('/\bsrc=["\']([^"\']+)["\']/i', $imageTag, $matches)) {
                return $matches[1];
            }
        }
    }

    if (preg_match('/!\[[^\]]*]\((\S+?)(?:\s+"[^"]*")?\)/', $content, $matches)) {
        return $matches[1];
    }

    if (preg_match('/\[img](.+?)\[\/img]/i', $content, $matches)) {
        return $matches[1];
    }

    return null;
}

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/resources/less/forum.less'),

    (new Extend\ApiSerializer(DiscussionSerializer::class))
        ->attribute('tuCoverImageUrl', function (DiscussionSerializer $serializer, Discussion $discussion) {
            $firstPost = $discussion->firstPost;

            if (! $firstPost instanceof CommentPost) {
                return null;
            }

            $content = (string) $firstPost->content;

            return tuDisscusionCardThemeExtractFirstImageUrl($content);
        }),
];

