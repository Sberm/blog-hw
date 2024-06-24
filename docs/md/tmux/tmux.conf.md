## tmux

god-like clear

```bash
if [[ $TMUX ]]; then
	alias clear='clear && tmux clear-history'
fi
```
