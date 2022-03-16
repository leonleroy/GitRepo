# Druid

Standard Druid, specifically Wildfire Druid abilities

* [Enhanced Bond](#enhanced-bond)

[*Back to All Class Features*](../README.md)

## Feature Notes

### Enhanced Bond

This fun little ability works vaguely like a warlock's hex, in fact, I based my approach on that ability's implementation.  Following is my description of this ability:

> *6th-level Circle of Wildfire feature*
> 
> The bond with your wildfire spirit enhances your destructive and restorative spells. Whenever you cast a spell that deals fire damage or restores hit points while your wildfire spirit is summoned: roll a d8, and you gain a bonus equal to the number rolled to one damage or healing roll of the spell.
> 
> In addition, when you cast a spell with a range other than self, the spell can originate from you or your wildfire spirit.
> 
> **FoundryVTT**: Your familiar's name is set with the  *Set Familiar Name* item.  A token with that name must be on the scene for this feature to automagically trigger.

The macro operates as a MIDI damageMacro.  

1. It checks for the existence of the familiar, exiting if not found. 
2. It then checks the nature of the invoking item.  If it is an item that does fire damage it adds a die of damage and a splash VFX.
3. If the invoking item was a heal, it adds a die of healing and a splash VFX.

![Aura_of_Protection.gif](Wild_Fire_6_Enhanced_Bond/Enhanced_Bond.gif)

![Enhanced_Bond_Chat.png](Wild_Fire_6_Enhanced_Bond/Enhanced_Bond_Chat.png)


[*Back to Druid top of document*](#druid)

---